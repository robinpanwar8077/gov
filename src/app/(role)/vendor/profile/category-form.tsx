"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import { useGracefulForm } from "@/hooks/use-graceful-form";
import { updateVendorCategories } from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormState } from "@/lib/types";
import { toast } from "sonner";
import { Search, CheckCircle2, AlertCircle, Loader2, Tag } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    subCategories: SubCategory[];
}

interface SubCategory {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
}

interface Props {
    allCategories: Category[];
    selectedCategoryIds: string[];
    selectedSubCategoryIds: string[];
}

const initialState: FormState = { error: "", success: false };

export function VendorCategoryForm({ allCategories, selectedCategoryIds, selectedSubCategoryIds }: Props) {
    const [state, formAction, isPending] = useActionState(updateVendorCategories, initialState);
    const [searchTerm, setSearchTerm] = useState("");
    const { handleSafeSubmit } = useGracefulForm();

    const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(selectedCategoryIds));
    const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set(selectedSubCategoryIds));

    useEffect(() => {
        if (state.success) {
            toast.success("Business categories updated successfully!");
        }
    }, [state.success]);

    const handleCategoryChange = (catId: string, checked: boolean) => {
        const newCats = new Set(selectedCats);
        const newSubs = new Set(selectedSubs);

        if (checked) {
            newCats.add(catId);
        } else {
            newCats.delete(catId);
            // Optionally deselect all subs of this cat
            const cat = allCategories.find(c => c.id === catId);
            if (cat) {
                cat.subCategories.forEach(sub => newSubs.delete(sub.id));
            }
        }
        setSelectedCats(newCats);
        setSelectedSubs(newSubs);
    };

    const handleSubChange = (subId: string, checked: boolean, catId: string) => {
        const newSubs = new Set(selectedSubs);
        const newCats = new Set(selectedCats);

        if (checked) {
            newSubs.add(subId);
            newCats.add(catId);
        } else {
            newSubs.delete(subId);
            // If no more subs are selected for this cat, should we deselect the cat? 
            // Better to keep it selected if they explicitly checked it, but often 
            // cat selection is driven by sub selection.
        }
        setSelectedSubs(newSubs);
        setSelectedCats(newCats);
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return allCategories;
        return allCategories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.subCategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [allCategories, searchTerm]);

    return (
        <form 
            onSubmit={(e) => handleSafeSubmit(e, formAction)}
            className="space-y-6"
        >
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-border p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" />
                                Business Classification
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Select categories and subcategories that represent your business.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No categories found matching "{searchTerm}"</p>
                            <Button variant="ghost" className="mt-2 text-primary" onClick={() => setSearchTerm("")}>Clear search</Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {filteredCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`relative group p-5 rounded-xl border transition-all duration-300 ${selectedCats.has(cat.id)
                                        ? 'bg-blue-50/30 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg transition-colors ${selectedCats.has(cat.id) ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <Checkbox
                                                    id={`cat-${cat.id}`}
                                                    checked={selectedCats.has(cat.id)}
                                                    onCheckedChange={(checked: boolean) => handleCategoryChange(cat.id, checked)}
                                                />
                                            </div>
                                            <Label htmlFor={`cat-${cat.id}`} className="font-bold text-lg cursor-pointer text-slate-800">
                                                {cat.name}
                                            </Label>
                                        </div>
                                        {selectedCats.has(cat.id) && (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                                {cat.subCategories.filter(s => selectedSubs.has(s.id)).length} Selected
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Subcategories */}
                                    <div className="grid grid-cols-1 gap-2 ml-1">
                                        {cat.subCategories.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${selectedSubs.has(sub.id) ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={`sub-${sub.id}`}
                                                    checked={selectedSubs.has(sub.id)}
                                                    onCheckedChange={(checked: boolean) => handleSubChange(sub.id, checked, cat.id)}
                                                    className="w-4 h-4"
                                                />
                                                <Label
                                                    htmlFor={`sub-${sub.id}`}
                                                    className={`text-sm cursor-pointer transition-colors ${selectedSubs.has(sub.id) ? 'font-semibold text-slate-900' : 'text-slate-500'
                                                        }`}
                                                >
                                                    {sub.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Selected Category ID hidden input for the form if checkbox is not sufficient for "all" 
                                        Actually, Checkbox with name="categories" handles it on submission if checked.
                                    */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {Array.from(selectedCats).length > 0 ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                {Array.from(selectedCats).length} Categories and {Array.from(selectedSubs).length} Subcategories selected
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                <AlertCircle className="w-4 h-4" />
                                Please select at least one category to continue.
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {state.error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                <AlertCircle className="w-4 h-4" />
                                {state.error}
                            </div>
                        )}
                        {state.success && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                <CheckCircle2 className="w-4 h-4" />
                                Profile updated successfully!
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending || selectedCats.size === 0}
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    SAVING...
                                </>
                            ) : "SAVE SELECTIONS"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hidden field for selected data if needed for fallback, 
                but we use standard named inputs. 
                Wait, if a category is filtered out by search, will its checked checkbox still be submitted?
                Next.js Form action typically sends ALL form fields in the DOM. 
                If they are hidden via display:none (filtering), they ARE STILL in the DOM and will be submitted.
                Since I'm just not rendering them in filteredCategories.map, they WON'T be in the DOM.
                THIS IS A BUG in the current approach if the user searches, selects, then searches something else and selects more.
                
                FIX: Always render ALL checkboxes but hide the ones that don't match. 
                Or keep a hidden input with the full list.
            */}

            <div className="hidden">
                {/* Render all selected items that might be filtered out current view */}
                {Array.from(selectedCats).map(id => (
                    <input key={`hidden-cat-${id}`} type="hidden" name="categories" value={id} />
                ))}
                {Array.from(selectedSubs).map(id => (
                    <input key={`hidden-sub-${id}`} type="hidden" name="subCategories" value={id} />
                ))}
            </div>
        </form>
    );
}
