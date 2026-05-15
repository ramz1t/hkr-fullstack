import { useRef, useEffect } from "react";

export interface LoadMoreTriggerProps {
  isFetching: boolean;
  error?: Error | null;
  hasNextPage: boolean;
  fetch(): void;
}

export const LoadMoreTrigger = ({
  isFetching,
  error,
  fetch,
  hasNextPage
}: LoadMoreTriggerProps) => {
  const loadMoreMarkerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && !isFetching && hasNextPage && !error) {
        fetch();
      }
    };

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.0
    };
    const observer: IntersectionObserver = new IntersectionObserver(
      callback,
      options
    );

    if (loadMoreMarkerRef.current) {
      observer.observe(loadMoreMarkerRef.current);
    }

    return () => observer.disconnect();
  }, [isFetching, hasNextPage, error, fetch]);

  if (!hasNextPage)
    return (
      <span className="col-span-full font-semibold font-heading text-center py-1 flex justify-center">
        End.
      </span>
    );

  return (
    <span className="mx-auto min-h-[1px] min-w-[1px] col-span-full">
      {isFetching && "Loading..."}
      {error && "Error"}
      <span
        ref={loadMoreMarkerRef}
        className="block min-h-[1px] min-w-[1px]"
      ></span>
    </span>
  );
};
