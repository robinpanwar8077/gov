"use client";

import { useState } from "react";
import { ConsultantService } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteConsultantService } from "@/lib/actions/consultant";
import { ServiceForm } from "./ServiceForm";

interface ServiceListProps {
    initialServices: ConsultantService[];
}

export function ServiceList({ initialServices }: ServiceListProps) {
    const [services, setServices] = useState<ConsultantService[]>(initialServices);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingService, setEditingService] = useState<ConsultantService | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this service?")) {
            const result = await deleteConsultantService(id);
            if (result.success) {
                setServices(services.filter(s => s.id !== id));
                // Toast would be nice here
            } else {
                alert(result.error || "Failed to delete service");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Managed Services</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add New Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                        </DialogHeader>
                        <ServiceForm onSuccess={() => {
                            setIsAddOpen(false);
                            window.location.reload(); // Simplest way to refresh for now
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            {services.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground mb-4">You haven't added any services yet.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Your First Service
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{service.title}</CardTitle>
                                    <Badge variant={service.isActive ? "default" : "secondary"}>
                                        {service.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-3">
                                    {service.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {service.pricingModel && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-primary">Pricing: </span>
                                        {service.pricingModel}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Dialog open={editingService?.id === service.id} onOpenChange={(open) => !open && setEditingService(null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setEditingService(service)}>
                                            <Pencil className="mr-2 h-3.3 w-3.5" /> Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Edit Service</DialogTitle>
                                        </DialogHeader>
                                        <ServiceForm service={service} onSuccess={() => {
                                            setEditingService(null);
                                            window.location.reload();
                                        }} />
                                    </DialogContent>
                                </Dialog>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                                    <Trash2 className="mr-2 h-3.3 w-3.5" /> Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
