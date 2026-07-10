import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const getInitials = (name) => {
	if (!name) return "U";
	return name
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
};

const Topbar = ({ sidebarCollapsed, onMobileMenu, user, onLogout }) => {
	const leftClass = sidebarCollapsed ? "md:left-[68px]" : "md:left-[240px]";
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		const q = searchQuery.trim();
		if (q) {
			navigate(`/dashboard/calls?q=${encodeURIComponent(q)}`);
			setSearchQuery("");
		}
	};

	const initials = getInitials(user?.name);
	const displayName = user?.name || "User";
	const displayEmail = user?.email || "";

	return (
		<header
			className={`fixed right-0 top-0 z-99 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl transition-[left] duration-300 md:px-6 ${leftClass} left-0 shadow-sm`}
		>
			<button
				className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 md:hidden"
				onClick={onMobileMenu}
				aria-label="Toggle menu"
				type="button"
			>
				<Menu size={20} />
			</button>

			{/* Search */}
			<form onSubmit={handleSearchSubmit} className="hidden max-w-96 flex-1 md:block lg:max-w-110">
				<div className="relative flex items-center">
					<Search size={15} className="pointer-events-none absolute left-3 text-gray-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search accounts, opportunities, calls..."
						className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-[0.85rem] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/20"
					/>
				</div>
			</form>

			<div className="ml-auto flex items-center gap-3">
				<div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.78rem] font-semibold text-emerald-600 md:flex">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
					<span>Live Workspace</span>
				</div>

				{/* Profile dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						type="button"
						onClick={() => setDropdownOpen((v) => !v)}
						className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 transition hover:border-orange-300 hover:bg-orange-50"
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] text-[0.7rem] font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]">
							{initials}
						</div>
						<span className="hidden max-w-28 truncate text-[0.83rem] font-medium text-gray-700 md:block">
							{displayName}
						</span>
						<ChevronDown
							size={14}
							className={`hidden text-gray-400 transition-transform duration-200 md:block ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>

					{dropdownOpen && (
						<div className="absolute right-0 top-full z-200 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-150">
							{/* User info */}
							<div className="border-b border-gray-100 px-4 py-3">
								<p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
								<p className="truncate text-xs text-gray-500">{displayEmail}</p>
								{user?.company_name && (
									<p className="mt-0.5 truncate text-xs text-orange-500">{user.company_name}</p>
								)}
							</div>

							{/* Links */}
							<div className="py-1.5">
								<Link
									to="/dashboard/profile"
									onClick={() => setDropdownOpen(false)}
									className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
								>
									<User size={15} />
									My Profile
								</Link>
								<Link
									to="/dashboard/profile"
									onClick={() => setDropdownOpen(false)}
									className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
								>
									<Settings size={15} />
									Account Settings
								</Link>
							</div>

							<div className="border-t border-gray-100 py-1.5">
								<button
									type="button"
									onClick={() => {
										setDropdownOpen(false);
										onLogout?.();
									}}
									className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
								>
									<LogOut size={15} />
									Sign out
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Topbar;