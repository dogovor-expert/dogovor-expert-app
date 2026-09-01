"use client";
import dynamic from "next/dynamic";

const HomeTemplateGrid = dynamic(
  () => import("./HomeTemplateGrid"),
  { ssr: false }
);

export default function HomeTemplateGridWrapper() {
  return <HomeTemplateGrid />;
}