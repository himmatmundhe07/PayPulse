"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type CustomerSearchPorps = {
    search: string;
    onSearchChange: (value: string) => void;
}


export default function CustomerSearch({search, onSearchChange}: CustomerSearchPorps){
    return(
        <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <Input placeholder="Search customers..." value={search} onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"  />
        </div>
    )
}