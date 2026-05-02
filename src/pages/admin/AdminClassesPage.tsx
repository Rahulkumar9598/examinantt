import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { classService, DEFAULT_CLASSES } from '../../services/classService';
import type { ClassRecord } from '../../services/classService';

const AdminClassesPage = () => {
    const [classes, setClasses] = useState<ClassRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newClass, setNewClass] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = classService.subscribe((records) => {
            setClasses(records);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = newClass.trim();
        if (!trimmed) return;
        if (classes.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            alert('Class already exists.');
            return;
        }
        setIsSaving(true);
        try {
            await classService.create(trimmed);
            setNewClass('');
        } catch (error: any) {
            console.error('Error adding class:', error);
            const code = typeof error?.code === 'string' ? error.code : '';
            alert(code ? `Could not add class (${code}). Please check your Firestore rules.` : 'Could not add class.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (c: ClassRecord) => {
        setEditId(c.id);
        setEditName(c.name);
    };

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editId) return;
        const trimmed = editName.trim();
        if (!trimmed) return;
        if (classes.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editId)) {
            alert('Another class with this name already exists.');
            return;
        }
        setIsSaving(true);
        try {
            await classService.update(editId, trimmed);
            setEditId(null);
            setEditName('');
        } catch (error) {
            console.error('Error updating class:', error);
            alert('Could not update class.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (c: ClassRecord) => {
        if (!window.confirm(`Delete class "${c.name}"? This will not remove existing test series or tests already tagged with it.`)) {
            return;
        }
        setIsSaving(true);
        try {
            await classService.delete(c.id);
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Could not delete class.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Classes</h1>
                    <p className="text-slate-500 mt-2">Add, edit, or remove class categories (e.g. Class 10, Class 12, JEE) from the admin dashboard.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Class List</h2>
                                <p className="text-sm text-slate-500">Current classes available in the admin dashboard.</p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {classes.length} classes
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={32} className="animate-spin text-slate-500" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {classes.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                                        No classes found. The dashboard will fall back to default classes until you add one.
                                    </div>
                                ) : (
                                    classes.map(c => (
                                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200 p-4 bg-white">
                                            <div className="space-y-1">
                                                <div className="text-slate-900 font-semibold">{c.name}</div>
                                                <div className="text-xs text-slate-500">ID: {c.id}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(c)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(c)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Default classes</h2>
                        <p className="text-sm text-slate-500 mb-4">These class names are used automatically when no custom classes are configured.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {DEFAULT_CLASSES.map(c => (
                                <div key={c} className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm text-slate-700">
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Add New Class</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Class Name</label>
                            <input
                                type="text"
                                value={newClass}
                                onChange={e => setNewClass(e.target.value)}
                                placeholder="e.g. Class 10"
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center w-full gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
                        >
                            <Plus size={18} />
                            {isSaving ? 'Saving...' : 'Add Class'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setEditName('');
                                }}
                                className="inline-flex items-center justify-center w-full gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                <X size={18} />
                                Cancel edit
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {editId && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Edit Class</h2>
                            <p className="text-sm text-slate-500">Update the class name for existing records.</p>
                        </div>
                    </div>
                    <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </form>
                </div>
            )}
        </motion.div>
    );
};

export default AdminClassesPage;
