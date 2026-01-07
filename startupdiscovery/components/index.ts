/**
 * Component Barrel Exports
 * Central entry point for importing reusable components
 *
 * Usage:
 * import { Header, Sidebar, LayoutWrapper, Button, Card, Input } from "@/components";
 */

// Layout components
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";

// UI components
export { default as Button } from "./ui/Button";
export { default as Card } from "./ui/Card";
export { default as Input } from "./ui/Input";

// Export types
export type { default as HeaderProps } from "./layout/Header";
export type { default as SidebarProps } from "./layout/Sidebar";
export type { default as LayoutWrapperProps } from "./layout/LayoutWrapper";
export type { default as ButtonProps } from "./ui/Button";
export type { default as CardProps } from "./ui/Card";
export type { default as InputProps } from "./ui/Input";
