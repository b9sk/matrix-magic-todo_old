import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { QuadrantCard } from '@/components/QuadrantCard';
import { TaskCard } from '@/components/TaskCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task, QuadrantType, QuadrantInfo } from '@/types/task';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { LayoutGrid, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('eisenhower-tasks', []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hideCompleted, setHideCompleted] = useLocalStorage<boolean>('hide-completed', false);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const { toast } = useToast();
  const t = useTranslations();

  // Seed demo data for first-time users
  useEffect(() => {
    try {
      const seededFlagKey = 'demo-seeded-v1';
      const alreadySeeded = window.localStorage.getItem(seededFlagKey);
      if (alreadySeeded) return;
      if (Array.isArray(tasks) && tasks.length > 0) return;

      const format = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const now = new Date();
      const plusDays = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
      const plusMonths = (n: number) => new Date(now.getFullYear(), now.getMonth() + n, now.getDate());

      const d1 = `#${format(plusDays(1))}`; // +1 day
      const d30 = `#${format(plusMonths(1))}`; // +1 month
      const d180 = `#${format(plusMonths(6))}`; // +6 months

      const demo: Task[] = [
        {
          id: `demo-${Date.now()}-1`,
          text: `Сделать годовой отчёт для руководства #работа ${d1}`,
          quadrant: 'urgent-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-2`,
          text: `Запланировать медосмотр и прививки #здоровье ${d30}`,
          quadrant: 'not-urgent-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-3`,
          text: `Заказать воду/канцелярию в #офис ${d1}`,
          quadrant: 'urgent-not-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-4`,
          text: `Отписаться от лишних рассылок и приложений`,
          quadrant: 'not-urgent-not-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-5`,
          text: `Подготовить презентацию стратегии на полгода ${d180}`,
          quadrant: 'not-urgent-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-6`,
          text: `Согласовать перенос встречи с клиентом ${d1}`,
          quadrant: 'urgent-not-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-7`,
          text: `Тренировка: бег 5 км ${d30}`,
          quadrant: 'not-urgent-important',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: `demo-${Date.now()}-8`,
          text: `Просмотр ленты социальных сетей #прокрастинация`,
          quadrant: 'not-urgent-not-important',
          completed: false,
          createdAt: Date.now(),
        },
      ];

      setTasks(demo);
      window.localStorage.setItem(seededFlagKey, 'true');
    } catch (e) {
      // no-op if localStorage unavailable
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const QUADRANTS: QuadrantInfo[] = [
    {
      id: 'urgent-important',
      title: t.quadrants['urgent-important'].title,
      subtitle: t.quadrants['urgent-important'].subtitle,
      color: 'text-quadrant-urgent-important-foreground',
      bgColor: 'bg-quadrant-urgent-important',
      borderColor: 'border-quadrant-urgent-important',
    },
    {
      id: 'not-urgent-important',
      title: t.quadrants['not-urgent-important'].title,
      subtitle: t.quadrants['not-urgent-important'].subtitle,
      color: 'text-quadrant-not-urgent-important-foreground',
      bgColor: 'bg-quadrant-not-urgent-important',
      borderColor: 'border-quadrant-not-urgent-important',
    },
    {
      id: 'urgent-not-important',
      title: t.quadrants['urgent-not-important'].title,
      subtitle: t.quadrants['urgent-not-important'].subtitle,
      color: 'text-quadrant-urgent-not-important-foreground',
      bgColor: 'bg-quadrant-urgent-not-important',
      borderColor: 'border-quadrant-urgent-not-important',
    },
    {
      id: 'not-urgent-not-important',
      title: t.quadrants['not-urgent-not-important'].title,
      subtitle: t.quadrants['not-urgent-not-important'].subtitle,
      color: 'text-quadrant-not-urgent-not-important-foreground',
      bgColor: 'bg-quadrant-not-urgent-not-important',
      borderColor: 'border-quadrant-not-urgent-not-important',
    },
  ];


  const handleAddTask = (quadrant: QuadrantType, text: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random()}`,
      text,
      quadrant,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([...tasks, newTask]);
    toast({
      title: t.taskAdded,
      description: t.taskAddedDescription,
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast({
      title: t.taskDeleted,
      description: t.taskDeletedDescription,
      variant: 'destructive',
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleEditTask = (id: string, newText: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, text: newText } : t
    ));
    toast({
      title: t.taskUpdated,
      description: t.taskUpdatedDescription,
    });
  };

  const handleMoveTask = (id: string, newQuadrant: QuadrantType) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, quadrant: newQuadrant } : t
    ));
    toast({
      title: t.taskMoved,
      description: t.taskMovedDescription,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    // Check if we're dropping on a quadrant or another task
    const isQuadrant = QUADRANTS.some(q => q.id === overId);
    
    if (isQuadrant) {
      // Moving to a different quadrant
      const newQuadrant = overId as QuadrantType;
      setTasks(tasks.map(t => 
        t.id === activeId ? { ...t, quadrant: newQuadrant } : t
      ));
    } else {
      // Reordering within the same quadrant or moving between quadrants
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) {
        setActiveTask(null);
        return;
      }

      if (activeTask.quadrant === overTask.quadrant) {
        // Reordering within the same quadrant
        const quadrantTasks = tasks.filter(t => t.quadrant === activeTask.quadrant);
        const oldIndex = quadrantTasks.findIndex(t => t.id === activeId);
        const newIndex = quadrantTasks.findIndex(t => t.id === overId);
        
        const reorderedQuadrantTasks = arrayMove(quadrantTasks, oldIndex, newIndex);
        
        // Merge back with other tasks
        const otherTasks = tasks.filter(t => t.quadrant !== activeTask.quadrant);
        setTasks([...otherTasks, ...reorderedQuadrantTasks]);
      } else {
        // Moving to a different quadrant by dropping on a task
        setTasks(tasks.map(t => 
          t.id === activeId ? { ...t, quadrant: overTask.quadrant } : t
        ));
      }
    }

    setActiveTask(null);
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\p{L}\p{N}_\-]+/gu;
    const matches = text.match(hashtagRegex);
    return matches || [];
  };

  const getAllHashtags = (): string[] => {
    const allHashtags = new Set<string>();
    tasks.forEach(task => {
      const hashtags = extractHashtags(task.text);
      hashtags.forEach(tag => allHashtags.add(tag));
    });
    return Array.from(allHashtags).sort();
  };

  const getTasksByQuadrant = (quadrant: QuadrantType) => {
    let quadrantTasks = tasks.filter(t => t.quadrant === quadrant);
    
    if (hideCompleted) {
      quadrantTasks = quadrantTasks.filter(t => !t.completed);
    }
    
    if (selectedHashtag) {
      quadrantTasks = quadrantTasks.filter(t => 
        extractHashtags(t.text).includes(selectedHashtag)
      );
    }
    
    return quadrantTasks;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t.appTitle}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            {t.appSubtitle}
          </p>
        </header>
        <div className='py-4 flex flex-wrap items-center gap-2'>
          <Button
              variant="outline"
              size="sm"
              onClick={() => setHideCompleted(!hideCompleted)}
              className="flex items-center gap-2"
          >
            {hideCompleted ? (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">{t.showCompleted}</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">{t.hideCompleted}</span>
              </>
            )}
          </Button>
          
          {getAllHashtags().length > 0 && (
            <>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex flex-wrap items-center gap-2">
                {selectedHashtag && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHashtag(null)}
                    className="h-7 px-2 text-xs"
                  >
                    {t.clearFilter}
                  </Button>
                )}
                {getAllHashtags().map(hashtag => (
                  <Button
                    key={hashtag}
                    variant={selectedHashtag === hashtag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedHashtag(selectedHashtag === hashtag ? null : hashtag)}
                    className="h-7 px-2 text-xs"
                  >
                    {hashtag}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {QUADRANTS.map((quadrant) => (
              <QuadrantCard
                key={quadrant.id}
                quadrant={quadrant}
                tasks={getTasksByQuadrant(quadrant.id)}
                onAddTask={(text) => handleAddTask(quadrant.id, text)}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onMoveTask={handleMoveTask}
                onHashtagClick={(tag) => setSelectedHashtag(tag)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onDelete={() => {}}
                onToggleComplete={() => {}}
                onHashtagClick={(tag) => setSelectedHashtag(tag)}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Index;
