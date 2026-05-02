import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { subjectService, DEFAULT_SUBJECTS } from '../../services/subjectService';
import type { SubjectRecord } from '../../services/subjectService';

const AdminSubjectsPage = () => {
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSubject, setNewSubject] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = subjectService.subscribe((records) => {
            setSubjects(records);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = newSubject.trim();
        if (!trimmed) return;
        if (subjects.some(subject => subject.name.toLowerCase() === trimmed.toLowerCase())) {
            alert('Subject already exists.');
            return;
        }
        setIsSaving(true);
        try {
            await subjectService.create(trimmed);
            setNewSubject('');
        } catch (error: any) {
            console.error('Error adding subject:', error);
            const code = typeof error?.code === 'string' ? error.code : '';
            alert(code ? `Could not add subject (${code}). Please check your Firestore rules.` : 'Could not add subject.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (subject: SubjectRecord) => {
        setEditId(subject.id);
        setEditName(subject.name);
    };

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editId) return;
        const trimmed = editName.trim();
        if (!trimmed) return;
        if (subjects.some(subject => subject.name.toLowerCase() === trimmed.toLowerCase() && subject.id !== editId)) {
            alert('Another subject with this name already exists.');
            return;
        }
        setIsSaving(true);
        try {
            await subjectService.update(editId, trimmed);
            setEditId(null);
            setEditName('');
        } catch (error) {
            console.error('Error updating subject:', error);
            alert('Could not update subject.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (subject: SubjectRecord) => {
        if (!window.confirm(`Delete subject "${subject.name}"? This will not remove questions or chapters already tagged with it.`)) {
            return;
        }
        setIsSaving(true);
        try {
            await subjectService.delete(subject.id);
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Could not delete subject.');
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
                    <h1 className="text-3xl font-bold text-slate-900">Manage Subjects</h1>
                    <p className="text-slate-500 mt-2">Add, edit, or remove subject categories from the admin dashboard.</p>
                </div>
                
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Subject List</h2>
                                <p className="text-sm text-slate-500">Current subjects available in the admin dashboard.</p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {subjects.length} subjects
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={32} className="animate-spin text-slate-500" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subjects.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                                        No subjects found. The dashboard will fall back to default subjects until you add one.
                                    </div>
                                ) : (
                                    subjects.map(subject => (
                                        <div key={subject.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200 p-4 bg-white">
                                            <div className="space-y-1">
                                                <div className="text-slate-900 font-semibold">{subject.name}</div>
                                                <div className="text-xs text-slate-500">ID: {subject.id}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(subject)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(subject)}
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
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Default subjects</h2>
                        <p className="text-sm text-slate-500 mb-4">These subject names are used automatically when no custom subjects are configured.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {DEFAULT_SUBJECTS.map(subject => (
                                <div key={subject} className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm text-slate-700">
                                    {subject}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Add New Subject</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Name</label>
                            <input
                                type="text"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                placeholder="e.g. Biology"
                                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center w-full gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
                        >
                            <Plus size={18} />
                            {isSaving ? 'Saving...' : 'Add Subject'}
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
                            <h2 className="text-lg font-bold text-slate-900">Edit Subject</h2>
                            <p className="text-sm text-slate-500">Update the subject name for existing records.</p>
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

export default AdminSubjectsPage;
