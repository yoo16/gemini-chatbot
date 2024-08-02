'use client';

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {

    return (
        <main className="flex flex-col justify-center">
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-10">
                <h1 className="text-2xl p-5">Gemini Sample</h1>
                <ul className="flex space-x-4">
                    <li className="text-lg font-semibold">
                        <Link href="/translate" className="hover:text-blue-500 transition-colors duration-200">
                            Translate
                        </Link>
                    </li>
                    <li className="text-lg font-semibold">
                        <Link href="/travel_plan" className="hover:text-blue-500 transition-colors duration-200">
                            Travel Plan
                        </Link>
                    </li>
                </ul>
            </div>
        </main>
    );
}
