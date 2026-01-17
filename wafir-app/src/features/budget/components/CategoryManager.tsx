import { useState, type FormEvent } from 'react';
import { useCategories, useCreateCategory } from '../api/budget';
import { X, Plus, Tag } from 'lucide-react';

interface CategoryManagerProps {
    onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const [newName, setNewName] = useState('');

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await createCategory.mutateAsync(newName);
            setNewName('');
        } catch (err) {
            alert('Failed to create category');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl border flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Tag className="w-5 h-5" /> Manage Categories
                    </h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        className="flex-1 p-2 rounded-md border bg-input"
                        placeholder="New category name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={createCategory.isPending}
                        className="bg-primary text-primary-foreground px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Plus size={20} />
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground p-4">Loading categories...</p>
                    ) : (
                        categories?.map(cat => (
                            <div key={cat.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center group">
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                                    {cat.userId ? 'Custom' : 'Default'}
                                </span>
                            </div>
                        ))
                    )}
                    {categories?.length === 0 && <p className="text-center text-muted-foreground">No categories found.</p>}
                </div>
            </div>
        </div>
    );
}
