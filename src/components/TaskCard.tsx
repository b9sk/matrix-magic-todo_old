import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, QuadrantType } from '@/types/task';
import { GripVertical, Trash2, Check, MoreVertical, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit?: (id: string, text: string) => void;
  onMove?: (id: string, quadrant: QuadrantType) => void;
  onHashtagClick?: (hashtag: string) => void;
}

export const TaskCard = ({ task, onDelete, onToggleComplete, onEdit, onMove, onHashtagClick }: TaskCardProps) => {
  const t = useTranslations();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(task.text);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(task.id, editText.trim());
      setIsEditDialogOpen(false);
    }
  };

  const renderTextWithHashtags = (text: string) => {
    const hashtagRegex = /#[\p{L}\p{N}_\-]+/gu;
    const parts: Array<{ type: 'text' | 'tag'; value: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = hashtagRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'tag', value: match[0] });
      lastIndex = hashtagRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'text') {
        return (
          <span key={`t-${idx}`}>{part.value}</span>
        );
      }
      return (
        <button
          key={`h-${idx}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onHashtagClick) onHashtagClick(part.value);
          }}
          className="text-primary hover:underline focus:underline focus:outline-none"
        >
          {part.value}
        </button>
      );
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group px-2 py-1 bg-transparent transition-all duration-200 touch-none",
        isDragging && "opacity-50 scale-105"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm break-words",
            task.completed && "line-through text-muted-foreground"
          )}>
            {renderTextWithHashtags(task.text)}
          </p>
        </div>

        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onToggleComplete(task.id)}
          >
            <Check className={cn("h-3 w-3", task.completed && "text-primary")} />
          </Button>
          {(onEdit || onMove) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border z-50">
              {onMove && (
                  <>
                    <DropdownMenuItem onClick={() => onMove(task.id, 'urgent-important')}>
                      {t.moveTo} {t.quadrants['urgent-important'].title}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(task.id, 'not-urgent-important')}>
                      {t.moveTo} {t.quadrants['not-urgent-important'].title}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(task.id, 'urgent-not-important')}>
                      {t.moveTo} {t.quadrants['urgent-not-important'].title}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(task.id, 'not-urgent-not-important')}>
                      {t.moveTo} {t.quadrants['not-urgent-not-important'].title}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onEdit && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Pencil className="h-3 w-3 mr-2" />
                      {t.editTask}
                    </DropdownMenuItem>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-3 w-3 mr-2 text-destructive" />
                      <span className="text-destructive">{t.deleteTask}</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteTask}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.deleteTaskConfirmation}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(task.id)}>
                        {t.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>{t.editTask}</DialogTitle>
            <DialogDescription>
              {t.taskUpdatedDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-text">{t.addTask}</Label>
              <Input
                id="task-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                placeholder={task.text}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editText.trim()}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
