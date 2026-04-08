import { PrismaClient } from '@prisma/client'
import { Role, KYCStatus } from '../src/lib/types'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@govpronet.com' },
        update: {},
        create: {
            email: 'admin@govpronet.com',
            mobile: '9999999999',
            passwordHash,
            role: Role.ADMIN,
            isVerified: true,
        },
    })
    console.log('✅ Admin created:', admin.email)

    // 2. Create Vendor
    const vendor = await prisma.user.upsert({
        where: { email: 'vendor@example.com' },
        update: {},
        create: {
            email: 'vendor@example.com',
            mobile: '9876543210',
            passwordHash,
            role: Role.VENDOR,
            isVerified: true,
            vendorProfile: {
                create: {
                    companyName: 'Dummy Vendor Ltd',
                    slug: 'dummy-vendor-ltd',
                    kycStatus: KYCStatus.APPROVED,
                },
            },
        },
    })
    console.log('✅ Vendor created:', vendor.email)

    // 3. Create OEM
    const oem = await prisma.user.upsert({
        where: { email: 'oem@example.com' },
        update: {},
        create: {
            email: 'oem@example.com',
            mobile: '8888888888',
            passwordHash,
            role: Role.OEM,
            isVerified: true,
            oemProfile: {
                create: {
                    companyName: 'Dummy OEM Corp',
                    slug: 'dummy-oem-corp',
                    kycStatus: KYCStatus.APPROVED,
                },
            },
        },
    })
    console.log('✅ OEM created:', oem.email)

    // 4. Create Consultant
    const consultant = await prisma.user.upsert({
        where: { email: 'consultant@example.com' },
        update: {},
        create: {
            email: 'consultant@example.com',
            mobile: '7777777777',
            passwordHash,
            role: Role.CONSULTANT,
            isVerified: true,
            consultantProfile: {
                create: {
                    name: 'Expert Consultant',
                    slug: 'expert-consultant',
                    kycStatus: KYCStatus.APPROVED,
                },
            },
        },
    })
    console.log('✅ Consultant created:', consultant.email)

    // 5. Seed Categories (Vendor/OEM)
    const categories = [
        {
            name: 'IT & Electronics',
            slug: 'it-electronics',
            subs: ['Laptops & Desktops', 'Servers', 'Networking Equipment', 'Printers & Scanners', 'Storage Devices', 'Software Licenses']
        },
        {
            name: 'Office Supplies & Furniture',
            slug: 'office-supplies',
            subs: ['Paper & Stationery', 'Steel Almirahs', 'Executive Chairs', 'Office Desks', 'Filing Cabinets', 'Writing Boards']
        },
        {
            name: 'Medical & Healthcare',
            slug: 'medical-healthcare',
            subs: ['Surgical Instruments', 'Medical Consumables', 'Laboratory Equipment', 'Hospital Furniture', 'Diagnostic Kits', 'PPE & Saftey Gear']
        },
        {
            name: 'Defense & Security',
            slug: 'defense-security',
            subs: ['Tactical Gear', 'Uniforms & Apparel', 'CCTV & Surveillance', 'Access Control Systems', 'Fire Safety Equipment', 'Communication Devices']
        },
        {
            name: 'Industrial & Electrical',
            slug: 'industrial-electrical',
            subs: ['Power Tools', 'Electrical Motors', 'Wires & Cables', 'Lighting Solutions', 'Generators & UPS', 'Measuring Instruments']
        },
        {
            name: 'Automobiles & Transport',
            slug: 'automobiles-transport',
            subs: ['Passenger Vehicles', 'Commercial Trucks', 'Utility Vans', 'Two Wheelers', 'Electric Vehicles', 'Vehicle Spare Parts']
        },
        {
            name: 'Services (Professional)',
            slug: 'services-professional',
            subs: ['Cleaning & Sanitation', 'Security Services', 'Manpower Supply', 'Cloud & Data Center', 'Facility Management', 'AMC Services']
        }
    ];

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { name: cat.name, slug: cat.slug }
        });

        for (const sub of cat.subs) {
            const subSlug = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            await prisma.subCategory.upsert({
                where: { slug: subSlug },
                update: {},
                create: {
                    name: sub,
                    slug: subSlug,
                    categoryId: category.id
                }
            });
        }
        console.log(`✅ Category seeded: ${cat.name}`);
    }

    // 6. Seed Consulting Categories
    const consultingCategories = [
        { name: 'Chartered Accountant (CA)', slug: 'ca', description: 'Financial auditing, tax compliance, and business advisory.' },
        { name: 'Legal Consultant', slug: 'legal', description: 'Legal advice, contract drafting, and regulatory compliance.' },
        { name: 'GeM Consultant', slug: 'gem', description: 'Expertise in Government e-Marketplace (GeM) registration and bidding.' },
        { name: 'Technical Consultant', slug: 'technical', description: 'Strategic advice on IT, engineering, and digital transformation.' },
        { name: 'Bid Management', slug: 'bid-management', description: 'Tender preparation, documentation, and submission support.' }
    ];

    for (const cat of consultingCategories) {
        await prisma.consultingCategory.upsert({
            where: { slug: cat.slug },
            update: { description: cat.description },
            create: { name: cat.name, slug: cat.slug, description: cat.description }
        });
        console.log(`✅ Consulting Category seeded: ${cat.name}`);
    }

    // 7. Seed Membership Plans
    const membershipPlans = [
        {
            slug: "starter",
            name: "Starter",
            price: 0,
            durationDays: 36500,
            description: "Perfect for new vendors starting their government procurement journey.",
            features: [
                "Basic Directory Listing",
                "Up to 3 Product Mappings",
                "Community Support",
                "Basic Analytics",
                "Notification Alerts"
            ],
            type: "Free"
        },
        {
            slug: "professional",
            name: "Professional",
            price: 4999,
            durationDays: 180,
            description: "Designed for growing vendors aiming for official OEM authorizations.",
            features: [
                "Standard Directory Listing",
                "Unlimited Product Mappings",
                "Official OEM Authorizations (Standard)",
                "Email & Chat Support",
                "Advanced Analytics Dashboard",
                "Priority Verification",
                "Verified Vendor Badge"
            ],
            isRecommended: true,
            tag: "Most Popular",
            type: "Premium"
        },
        {
            slug: "enterprise",
            name: "Enterprise",
            price: 8499,
            durationDays: 365,
            description: "The ultimate plan for scale, with maximum visibility and trust markers.",
            features: [
                "Premium Directory Placement",
                "Unlimited Product Mappings",
                "Priority OEM Authorizations (Top-tier)",
                "Dedicated Relationship Manager",
                "White-glove Verification",
                "Exclusive Buyer Networking",
                "Custom Reporting Capabilities",
                "Early Access to Tenders"
            ],
            type: "Premium"
        }
    ];

    for (const plan of membershipPlans) {
        await prisma.membershipPlan.upsert({
            where: { slug: plan.slug },
            update: {
                price: plan.price,
                durationDays: plan.durationDays,
                description: plan.description,
                features: plan.features,
                type: plan.type,
                isRecommended: plan.isRecommended || false,
                tag: plan.tag || null
            },
            create: {
                slug: plan.slug,
                name: plan.name,
                price: plan.price,
                durationDays: plan.durationDays,
                description: plan.description,
                features: plan.features,
                type: plan.type,
                isRecommended: plan.isRecommended || false,
                tag: plan.tag || null
            }
        });
        console.log(`✅ Membership Plan seeded: ${plan.name}`);
    }

    // 8. Seed Coupons
    const coupons = [
        {
            code: "WELCOME50",
            discountType: "PERCENTAGE",
            discountValue: 50,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            usageLimit: 100,
            applicablePlans: [], // All plans
            isActive: true
        },
        {
            code: "SAVE1000",
            discountType: "FIXED",
            discountValue: 1000,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            usageLimit: 50,
            applicablePlans: ["professional", "enterprise"],
            minAmount: 4000,
            isActive: true
        }
    ];

    for (const cp of coupons) {
        await prisma.coupon.upsert({
            where: { code: cp.code },
            update: cp,
            create: cp
        });
        console.log(`✅ Coupon seeded: ${cp.code}`);
    }
    console.log(`✅ Coupon seeded: ${coupons[1].code}`);


    // 9. Seed Blog Categories & Tags
    const blogCategories = [
        { name: 'Updates', slug: 'updates' },
        { name: 'Guides', slug: 'guides' },
        { name: 'Success Stories', slug: 'success-stories' },
        { name: 'Tips & Tricks', slug: 'tips-tricks' },
        { name: 'Procurement', slug: 'procurement' },
    ];

    for (const cat of blogCategories) {
        await prisma.blogCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat
        });
    }

    const blogTags = [
        { name: 'GeM', slug: 'gem' },
        { name: 'GovProNet', slug: 'govpronet' },
        { name: 'Tenders', slug: 'tenders' },
        { name: 'MSME', slug: 'msme' },
        { name: 'Compliance', slug: 'compliance' },
        { name: 'OEM', slug: 'oem' },
    ];

    for (const tag of blogTags) {
        await prisma.blogTag.upsert({
            where: { slug: tag.slug },
            update: {},
            create: tag
        });
    }

    // 10. Seed Blog Posts
    const blogPosts = [
        {
            title: "Navigating the GeM Portal: A Beginner's Guide",
            slug: "navigating-gem-portal-beginners-guide",
            excerpt: "A comprehensive guide to help you get started with the Government e-Marketplace (GeM) portal.",
            coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000",
            content: `
# Navigating the GeM Portal: A Beginner's Guide

The Government e-Marketplace (GeM) is a one-stop portal to facilitate online procurement of common use Goods & Services required by various Government Departments / Organizations / PSUs. GeM aims to enhance transparency, efficiency and speed in public procurement.

## Getting Started

1. **Registration**: The first step is to register on the GeM portal. You will need your PAN card, Aadhaar card, and GSTIN (if applicable).
2. **Dashboard Overview**: Once logged in, the dashboard provides a snapshot of your activities, including pending orders, bids, and payments.
3. **Updating Profile**: Ensure your profile is 100% complete. Add all relevant certifications and tax documents.

## Key Features

- **Direct Purchase**: For amounts up to ₹25,000.
- **L1 Purchase**: For amounts between ₹25,000 and ₹5 Lakhs.
- **e-Bidding**: For amounts above ₹5 Lakhs.

Stay tuned for more detailed guides on each of these features!
            `,
            published: true,
            categories: { connect: [{ slug: 'guides' }, { slug: 'procurement' }] },
            tags: { connect: [{ slug: 'gem' }, { slug: 'govpronet' }] }
        },
        {
            title: "Success Story: How 'TechSol' Scored Big with Army Contracts",
            slug: "success-story-techsol-army-contracts",
            excerpt: "Learn how a small IT vendor scaled their business by winning major defense contracts through GovProNet.",
            coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000",
            content: `
# Success Story: How 'TechSol' Scored Big with Army Contracts

In 2024, a small IT hardware vendor based in Pune, 'TechSol', faced a challenge. They had high-quality rugged laptops but lacked the visibility to reach major government buyers. That's when they discovered GovProNet and the GeM ecosystem.

## The Strategy

TechSol focused on three key areas:
1. **OEM Authorization**: They secured authorization from a major rugged laptop OEM via GovProNet.
2. **Compliance**: They ensured every single compliance document was up to date.
3. **Competitive Pricing**: By analyzing past bid data, they optimized their pricing strategy.

## The Result

Within 6 months, TechSol won a contract to supply 500 units to the Northern Command of the Indian Army. "The transparency of GeM and the guidance from GovProNet were game-changers," says Rahul, CEO of TechSol.

This story proves that with the right preparation, even small players can win big.
            `,
            published: true,
            categories: { connect: [{ slug: 'success-stories' }] },
            tags: { connect: [{ slug: 'msme' }, { slug: 'oem' }] }
        },
        {
            title: "New Feature Update: Bulk Procurement Guidelines 2025",
            slug: "new-feature-update-bulk-procurement-2025",
            excerpt: "Ministry of Finance releases new guidelines for bulk procurement effective April 1st, 2025.",
            coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000",
            content: `
# New Feature Update: Bulk Procurement Guidelines 2025

The Ministry of Finance has released new guidelines for bulk procurement on the GeM portal, effective from April 1st, 2025. These changes aim to streamline large-scale purchases and encourage participation from MSMEs.

## What's Changed?

### 1. Unified Procurement System
Departments can now bundle requirements across multiple locations into a single bid, provided the delivery timelines are staggered.

### 2. MSME Reservation
A mandatory 25% reservation for MSMEs is now strictly enforced for all bulk tenders above ₹1 Crore.

### 3. Automated Payments
For bulk orders, an escrow mechanism is being piloted to ensure vendors receive 80% of the payment within 10 days of delivery acceptance.

## What You Need to Do

- **Update Your Inventory**: Ensure your stock levels are accurate.
- **Check MSME Status**: Verify your Udyam Registration number on the portal.

We recommend reviewing the detailed PDF available in the resources section of your dashboard.
            `,
            published: true,
            categories: { connect: [{ slug: 'updates' }, { slug: 'procurement' }] },
            tags: { connect: [{ slug: 'gem' }, { slug: 'compliance' }] }
        },
        {
            title: "Top 5 Mistakes Vendors Make on GeM (And How to Avoid Them)",
            slug: "top-5-mistakes-vendors-make-gem",
            excerpt: "Avoid common pitfalls that lead to bid disqualification with our expert tips.",
            coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000",
            content: `
# Top 5 Mistakes Vendors Make on GeM (And How to Avoid Them)

Participating in government tenders can be lucrative, but minor errors often lead to disqualification. Here are the top 5 mistakes we see vendors making:

1. **Incomplete Technical Documents**: Always double-check the 'Scope of Work' and attach every requested document.
2. **Ignoring Pre-Bid Meetings**: These meetings are crucial for clarifications. Skipping them means you might miss critical amendments.
3. **Wait Till the Last Minute**: Server issues happen. Don't wait until 5 PM on the last day to submit your bid.
4. **Incorrect Categorization**: Listing your product in the wrong category makes it invisible to relevant buyers.
5. **Pricing Errors**: Quoting exclusive of GST when inclusive was asked (or vice versa) is a common rejection reason.

**Pro Tip**: Use GovProNet's 'Bid Checklist' tool to automatically scan your submission for these common errors before you upload.
            `,
            published: true,
            categories: { connect: [{ slug: 'tips-tricks' }] },
            tags: { connect: [{ slug: 'gem' }, { slug: 'tenders' }] }
        },
        {
            title: "Understanding OEM Authorization: Why It Matters",
            slug: "understanding-oem-authorization",
            excerpt: "Why being an authorized reseller is crucial for long-term success in government procurement.",
            coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000",
            content: `
# Understanding OEM Authorization: Why It Matters

In the world of government procurement, authenticity is paramount. The Original Equipment Manufacturer (OEM) Authorization is a document that proves a reseller is authorized to sell the OEM's products.

## Why Do Buyers Care?

- **Warranty Support**: Authorized vendors guarantee valid warranty support from the manufacturer.
- **Genuine Products**: It eliminates the risk of counterfeit or refurbished goods.
- **Long-term Support**: For sensitive projects, buyers need assurance that spare parts and service will be available for years.

## How to Get Authorized

1. **Apply via GovProNet**: Our platform connects you directly with registered OEMs.
2. **Meet Criteria**: OEMs often look for technical capability, financial stability, and geographic presence.
3. **Maintain Status**: It's not a one-time event. You must maintain sales targets and service quality to keep your authorization.

Don't lose a bid because you lacked a piece of paper. Start your authorization process today!
            `,
            published: true,
            categories: { connect: [{ slug: 'guides' }] },
            tags: { connect: [{ slug: 'oem' }, { slug: 'compliance' }] }
        },
        {
            title: "GovProNet Quarterly Update: What's New in Q1 2026",
            slug: "govpronet-update-q1-2026",
            excerpt: "Check out the latest features including AI-powered bid matching and our new mobile app.",
            coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000",
            content: `
# GovProNet Quarterly Update: What's New in Q1 2026

Welcome to the first quarterly update of 2026! We have been working hard to improve your experience. Here is what's new.

## 🚀 AI-Powered Bid Matching
Our new AI engine now analyzes your product catalog and past wins to recommend the most relevant active tenders. You will see a "Match Score" next to every bid.

## 📱 Mobile App Enhancements
The GovProNet mobile app now supports:
- **Biometric Login**: Secure and fast access.
- **Offline Mode**: View saved tenders even without internet.
- **Chat Support**: connect with OEMs directly from the app.

## 🔒 Enhanced Security
We have introduced Two-Factor Authentication (2FA) for all sensitive transactions, including profile updates and bid withdrawals.

Update your app today to experience these features!
            `,
            published: true,
            categories: { connect: [{ slug: 'updates' }] },
            tags: { connect: [{ slug: 'govpronet' }] }
        }
    ];
    for (const post of blogPosts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: post,
            create: post
        });
        console.log(`✅ Blog Post seeded: ${post.title}`);
    }

    // 11. Seed Resources
    const resources = [
        {
            title: "GeM Vendor Onboarding Guide",
            slug: "gem-vendor-onboarding-guide",
            description: "A step-by-step guide to registering and setting up your vendor profile on the Government e-Marketplace (GeM).",
            type: 'GUIDE' as const,
            topic: "Onboarding",
            audience: "Vendors",
            published: true,
            fileUrl: "https://example.com/gem-onboarding-guide.pdf",
            content: "Detailed content about GeM onboarding process..."
        },
        {
            title: "MSME Success Story: Scaling via GeM",
            slug: "msme-success-story-gem",
            description: "How a small textile manufacturer increased their revenue by 40% through GeM procurement.",
            type: 'CASE_STUDY' as const,
            topic: "Success Stories",
            audience: "All",
            published: true,
            fileUrl: "https://example.com/msme-case-study.pdf"
        },
        {
            title: "Bid Management Best Practices",
            slug: "bid-management-best-practices",
            description: "Exhaustive guide on managing bids, understanding tender documents, and submission strategy.",
            type: 'GUIDE' as const,
            topic: "Bidding",
            audience: "Vendors & Consultants",
            published: true,
            fileUrl: "https://example.com/bid-management-guide.pdf"
        },
        {
            title: "OEM Compliance Requirements 2026",
            slug: "oem-compliance-2026",
            description: "Latest compliance and documentation requirements for Original Equipment Manufacturers on GeM.",
            type: 'GUIDE' as const,
            topic: "Compliance",
            audience: "OEMs",
            published: false, // Draft
        }
    ];

    for (const resource of resources) {
        await prisma.resource.upsert({
            where: { slug: resource.slug },
            update: resource,
            create: {
                ...resource,
                authorId: admin.id
            }
        });
        console.log(`✅ Resource seeded: ${resource.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
