import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, QuadrantInfo, QuadrantType } from '@/types/task';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuadrantCardProps {
  quadrant: QuadrantInfo;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, text: string) => void;
  onMoveTask: (id: string, quadrant: QuadrantType) => void;
  onHashtagClick?: (hashtag: string) => void;
}

export const QuadrantCard = ({
  quadrant,
  tasks,
  onAddTask,
  onDeleteTask,
  onToggleComplete,
  onEditTask,
  onMoveTask,
  onHashtagClick,
}: QuadrantCardProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: quadrant.id,
  });

  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-200",
      isOver && "ring-2 ring-primary scale-[1.02]"
    )}>
      <div className={cn("p-4 rounded-t-lg", quadrant.bgColor, quadrant.color)}>
        <h2 className="text-lg font-bold">{quadrant.title}</h2>
        <p className="text-sm opacity-90">{quadrant.subtitle}</p>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onMove={onMoveTask}
                onHashtagClick={onHashtagClick}
              />
            ))}
          </SortableContext>
        </div>
      </div>

      <div className="p-4 pt-0">
        <AddTaskForm onAdd={onAddTask} />
      </div>
    </Card>
  );
};
