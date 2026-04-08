import { getPublishedResourceBySlug } from "@/lib/actions/resource";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
    BookOpen,
    FileText,
    Download,
    ChevronLeft,
    Calendar,
    User,
    Tag,
    ArrowRight,
    Share2,
    CalendarClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import { ViewTracker } from "@/components/analytics/view-tracker";
import { DownloadTracker } from "@/components/analytics/download-tracker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { resource } = await getPublishedResourceBySlug(slug);

    if (!resource) return { title: "Resource Not Found" };

    return {
        title: `${resource.title} | GovProNet Resources`,
        description: resource.description || `Read our ${resource.type.toLowerCase().replace('_', ' ')} on ${resource.topic}.`,
    };
}

export default async function ResourceDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const { resource, error } = await getPublishedResourceBySlug(slug);

    if (!resource || error) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-screen">
            <ViewTracker id={resource.id} type="resource" />
            <Button variant="ghost" asChild className="mb-8 hover:bg-transparent -ml-2 text-muted-foreground hover:text-foreground transition-colors group">
                <Link href="/resources" className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Resources
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={resource.type === 'GUIDE' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-green-100 text-green-700 border-green-200"}>
                                {resource.type === 'GUIDE' ? "GUIDE" : "CASE STUDY"}
                            </Badge>
                            {resource.topic && (
                                <Badge variant="outline" className="text-primary border-primary/20">
                                    {resource.topic}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            {resource.title}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed italic">
                            {resource.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 py-4 border-y border-muted-foreground/10 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            <span>Updated {format(new Date(resource.publishedAt || resource.createdAt), "MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>By GovProNet Editorial</span>
                        </div>
                        {resource.audience && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span>Audience: {resource.audience}</span>
                            </div>
                        )}
                    </div>

                    {resource.content ? (
                        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
                            {/* Rendering as raw text or simple markdown-like rendering for now */}
                            <div className="whitespace-pre-wrap leading-relaxed space-y-4">
                                {resource.content}
                            </div>
                        </article>
                    ) : (
                        <div className="bg-muted/30 rounded-3xl p-12 text-center border border-muted-foreground/10 flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">This Resource is a Downloadable File</h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                                The full content of this {resource.type.toLowerCase().replace('_', ' ')} is available in the attached document. Please download it below to view all details.
                            </p>
                            {resource.fileUrl && (
                                <DownloadTracker id={resource.id}>
                                    <Button size="lg" asChild className="rounded-full px-10 h-14 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all">
                                        <Link href={resource.fileUrl} target="_blank" download>
                                            <Download className="mr-3 h-5 w-5" /> Download PDF Guide
                                        </Link>
                                    </Button>
                                </DownloadTracker>
                            )}
                        </div>
                    )}

                    <div className="pt-12 border-t mt-12">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-primary" /> Spread the Knowledge
                        </h3>
                        <div className="flex gap-4">
                            <Button variant="outline" className="rounded-full">Share on LinkedIn</Button>
                            <Button variant="outline" className="rounded-full">Share on Twitter</Button>
                            <Button variant="outline" className="rounded-full px-6">Copy Link</Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {resource.fileUrl && (
                        <div className="bg-primary p-8 rounded-3xl text-primary-foreground shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Get the PDF Version</h3>
                            <p className="text-primary-foreground/80 mb-8 leading-relaxed relative z-10">
                                Download this {resource.type.toLowerCase().replace('_', ' ')} to read offline or share with your team.
                            </p>
                            <DownloadTracker id={resource.id}>
                                <Button variant="secondary" size="lg" asChild className="w-full font-bold h-12 shadow-sm hover:bg-white transition-colors relative z-10">
                                    <Link href={resource.fileUrl} target="_blank" download>
                                        <Download className="mr-2 h-4 w-4" /> Download Now
                                    </Link>
                                </Button>
                            </DownloadTracker>
                        </div>
                    )}

                    <div className="bg-card border rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Related Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">GeM Bidding</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Compliance</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Onboarding</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">L1 Purchase</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Direct Purchase</Badge>
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-3xl p-8 border border-dashed border-muted-foreground/20">
                        <h4 className="font-bold mb-2">Need Help with Bidding?</h4>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Our experts can help you prepare winning bids and navigate the complexities of GeM.
                        </p>
                        <Button asChild variant="link" className="p-0 h-auto font-bold text-primary group">
                            <Link href="/consultants" className="flex items-center gap-2">
                                Find a GeM Consultant
                                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
