import { useEffect, useState } from "react";

export default function useDebounce(value: any, ms: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), ms);

        return () => clearTimeout(handler);
    }, [value, ms]);

    return debouncedValue;
}
