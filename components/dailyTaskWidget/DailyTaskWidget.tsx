import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import InfoIcon from "@mui/icons-material/Info";
import { Modal, IconButton } from "@mui/material";
import { checkAuth } from "../navigation/NavBar";
import { IDailyTask } from "@/models/DailyTask";

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isEditing?: boolean;
}

export default function DailyTasksWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedTaskForDescription, setSelectedTaskForDescription] = useState<
    string | null
  >(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            const tasksWithId = data.map((task: IDailyTask) => ({
              ...task,
              id: task._id ? task._id.toString() : task.id,
            }));
            setTasks(tasksWithId);
          } else {
            setTasks([]);
          }
        } else {
          setError("Fehler beim Laden der Aufgaben.");
        }
      } catch (err) {
        console.error("Fehler beim Laden der Aufgaben:", err);
        setError("Fehler beim Laden der Aufgaben.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const isAuthed = checkAuth();

  const toggleTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: "PUT",
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, completed: updatedTask.completed }
              : task
          )
        );
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Aufgabe:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isAuthed) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Fehler beim Löschen der Aufgabe:", error);
    }
  };

  const startEditing = (taskId: string) => {
    if (!isAuthed) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isEditing: true } : task
      )
    );
  };

  const saveEdit = async (taskId: string, newTitle: string) => {
    if (!isAuthed) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, title: newTitle, isEditing: false }
              : task
          )
        );
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Bearbeitung:", error);
    }
  };

  const addNewTask = async () => {
    if (!isAuthed) return;
    if (newTaskTitle.trim()) {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim() || undefined,
          }),
        });
        if (res.ok) {
          const newTaskData = await res.json();
          if (newTaskData?.task) {
            const task = newTaskData.task;
            const transformedTask: DailyTask = {
              ...task,
              id: task._id ? task._id.toString() : task.id,
            };
            setTasks((prev) => [...prev, transformedTask]);
          }
          setNewTaskTitle("");
          setNewTaskDescription("");
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe:", error);
      }
    }
  };

  const handleDescriptionOpen = (taskId: string) => {
    setSelectedTaskForDescription(taskId);
  };

  const handleDescriptionClose = () => {
    setSelectedTaskForDescription(null);
  };

  if (!isMounted) return null;
  if (isLoading) {
    return (
      <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
        <p className="text-center text-gray-500">Lade Aufgaben...</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="col-span-full rounded-xl bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
          Tägliche Aufgaben
        </h2>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
          {tasks.filter((t) => !t.completed).length} verbleibend
        </span>
      </div>

      {isAuthed && (
        <div className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Neuer Aufgabentitel"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Beschreibung hinzufügen (optional)"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNewTask();
            }}
          />
          <button
            onClick={addNewTask}
            className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-gray-500">
            Keine Tasks vorhanden
          </p>
        ) : (
          tasks.map((task) => {
            const showInfoIcon = !!task.description;
            const isDescriptionModalOpen =
              selectedTaskForDescription === task.id;

            return (
              <div key={task.id}>
                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex flex-1 items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-gray-400 hover:text-purple-600"
                    >
                      {task.completed ? (
                        <CheckCircleSolidIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6" />
                      )}
                    </button>

                    <div className="flex flex-1 items-center gap-2">
                      {task.isEditing ? (
                        <input
                          type="text"
                          defaultValue={task.title}
                          className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          onBlur={(e) => saveEdit(task.id, e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-1 items-center gap-2">
                          <span
                            className={`truncate text-sm md:text-base ${
                              task.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {task.title}
                          </span>
                          {showInfoIcon && (
                            <IconButton
                              onClick={() => handleDescriptionOpen(task.id)}
                              size="small"
                              aria-label="Beschreibung anzeigen"
                              className="!text-gray-400 hover:!text-purple-600"
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isAuthed && (
                    <div className="flex gap-2">
                      {!task.completed && (
                        <button
                          onClick={() => startEditing(task.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-purple-600"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <Modal
                  open={isDescriptionModalOpen}
                  onClose={handleDescriptionClose}
                  className="flex items-center justify-center p-4"
                >
                  <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <p className="text-gray-600">{task.description}</p>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleDescriptionClose}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Schließen
                      </button>
                    </div>
                  </div>
                </Modal>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
