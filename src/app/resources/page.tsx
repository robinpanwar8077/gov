import { getPublishedResources, getResourceTopics } from "@/lib/actions/resource";
import { ResourceFilters } from "./_components/resource-filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, FileText, Download, ArrowRight, BookMarked, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResourceType } from "@prisma/client";
import { DownloadTracker } from "@/components/analytics/download-tracker";

export const metadata = {
    title: "Resources & Guides | GovProNet",
    description: "Access educational guides, case studies, and resources to help you succeed on the GeM portal and government procurement.",
};

export default async function ResourcesPage({
    searchParams
}: {
    searchParams: Promise<{
        page?: string;
        type?: string;
        topic?: string;
        search?: string
    }>
}) {
    const { page, type, topic, search } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 12;

    const [resourcesRes, topicsRes] = await Promise.all([
        getPublishedResources(currentPage, limit, {
            type: type as ResourceType,
            topic,
            search
        }),
        getResourceTopics()
    ]);

    const resources = resourcesRes.resources || [];
    const topics = topicsRes.topics || [];
    const totalPages = resourcesRes.totalPages || 0;

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-screen">
            <div className="flex flex-col items-center text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                    <BookMarked className="h-4 w-4" />
                    Knowledge Center
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">GeM Guides & Resources</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Master the Government e-Marketplace with our curated collection of expert guides and real-world case studies.
                </p>
            </div>

            <ResourceFilters topics={topics} />

            {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="group flex flex-col h-full border-muted-foreground/10 hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden">
                            <div className="h-2 w-full bg-muted overflow-hidden">
                                <div className={resource.type === 'GUIDE' ? "h-full w-full bg-blue-500" : "h-full w-full bg-green-500"}></div>
                            </div>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="secondary" className="font-medium">
                                        {resource.type === 'GUIDE' ? (
                                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Guide</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Case Study</span>
                                        )}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(resource.publishedAt || resource.createdAt), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    <Link href={`/resources/${resource.slug}`}>{resource.title}</Link>
                                </CardTitle>
                                {resource.topic && (
                                    <div className="text-sm font-medium text-primary/80 mt-1">
                                        {resource.topic}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="grow">
                                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                                    {resource.description || "Learn more about this resource and how it can help you in your GeM journey."}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-muted-foreground/5 bg-muted/5 gap-3">
                                <Button asChild variant="outline" className="flex-1 font-semibold">
                                    <Link href={`/resources/${resource.slug}`}>
                                        View Details
                                    </Link>
                                </Button>
                                {resource.fileUrl ? (
                                    <DownloadTracker id={resource.id} className="flex-1">
                                        <Button asChild className="w-full font-semibold group-hover:scale-[1.02] transition-transform">
                                            <Link href={resource.fileUrl} target="_blank" download>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </Link>
                                        </Button>
                                    </DownloadTracker>
                                ) : (
                                    <Button asChild className="flex-1 font-semibold group-hover:scale-[1.02] transition-transform">
                                        <Link href={`/resources/${resource.slug}`}>
                                            Learn More <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                    <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                    <Button variant="link" asChild className="mt-4">
                        <Link href="/resources">Clear all filters</Link>
                    </Button>
                </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-16 pb-12">
                {currentPage > 1 && (
                    <Button variant="outline" asChild size="lg">
                        <Link href={`/resources?page=${currentPage - 1}${type ? `&type=${type}` : ''}${topic ? `&topic=${topic}` : ''}${search ? `&search=${search}` : ''}`}>
                            Previous
                        </Link>
                    </Button>
                )}

                {totalPages > 1 && (
                    <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                )}

                {currentPage < (totalPages || 0) && (
                    <Button variant="outline" asChild size="lg">
                        <Link href={`/resources?page=${currentPage + 1}${type ? `&type=${type}` : ''}${topic ? `&topic=${topic}` : ''}${search ? `&search=${search}` : ''}`}>
                            Next
                        </Link>
                    </Button>
                )}
            </div>

            <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center border border-primary/10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't find what you need?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Our team is constantly adding new guides and resources. If you have a specific topic you'd like us to cover, let us know.
                </p>
                <Button size="lg" asChild className="rounded-full px-8">
                    <Link href="/contact">Request a Resource</Link>
                </Button>
            </div>
        </div>
    );
}
