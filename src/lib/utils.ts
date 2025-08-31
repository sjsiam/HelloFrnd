import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date_ms: number) {
  // Convert milliseconds to seconds
  const date_seconds = date_ms / 1000;

  // Convert to Date object
  const date_obj = new Date(date_seconds * 1000);

  // Get current date and time
  const current_date = new Date();
  current_date.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  const current_time = current_date.getTime();

  // Get the date part of the provided date
  const provided_date = new Date(date_obj);
  provided_date.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0

  // Check if it's today
  if (provided_date.getTime() === current_time) {
    return date_obj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Check if it's yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  if (provided_date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Check if it's a different day of the week
  if (provided_date.getDay() < current_date.getDay()) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[provided_date.getDay()];
  }

  // If none of the above conditions match, return in a different format
  return (
    provided_date.getMonth() +
    1 +
    "/" +
    provided_date.getDate() +
    "/" +
    provided_date.getFullYear()
  );
}
