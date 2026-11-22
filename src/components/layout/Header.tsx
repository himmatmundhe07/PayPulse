import { Bell, Search } from "lucide-react"

type HeaderProp = {
    title: string
}

const Header = ({title}: HeaderProp) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-5">
            {/* <div className="flex items-center gap-2 rounded-lg border px-3 py-2">

                <Search size={18} className="text-gray-400"/>

                <input type="text" placeholder="Search...."  className="w-40 text-sm outline-none"/>

            </div> */}

            <button  className="relative text-gray-600 hover:text-blue-600">
                <Bell size={18} />
                {/* <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" /> */}
            </button>

            <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                    NK
                </div>

                {/* <div>
                    <p className="text-sm font-medium text-gray-800">Admin</p>
                    <p className="text-xs text-gray-500">Adminastrator</p>
                </div> */}
            </div>
        </div>
    </header>
  )
}

export default Header
