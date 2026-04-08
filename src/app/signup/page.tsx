import { Suspense } from "react";
import SignupClient from "./signup-client";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <SignupClient />
        </Suspense>
    );
}
