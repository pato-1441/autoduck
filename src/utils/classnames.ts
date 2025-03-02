export function cn(
  ...classes: (
    | string
    | boolean
    | undefined
    | null
    | { [key: string]: boolean }
  )[]
): string {
  return classes
    .filter(Boolean)
    .map((c) => {
      if (typeof c === "object" && c !== null) {
        return Object.entries(c)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return c;
    })
    .flat()
    .join(" ");
}
