"use client";

import { useCallback, useEffect, useState } from "react";

type ResourceState<T> = { data?: T; error?: Error; loading: boolean };

/**
 * Tải dữ liệu bất đồng bộ, bỏ qua kết quả trễ khi `key` đổi hoặc component unmount.
 * `load` chỉ được gọi lại khi `key` đổi, nên `key` phải mã hóa mọi đầu vào của `load`.
 */
export function useAsyncResource<T>(load: () => Promise<T>, key = "") {
  const [state, setState] = useState<ResourceState<T>>({ loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState(current => ({ ...current, loading: true, error: undefined }));
    load().then(
      data => { if (!cancelled) setState({ data, loading: false }); },
      (error: unknown) => { if (!cancelled) setState(current => ({ ...current, loading: false, error: error instanceof Error ? error : new Error(String(error)) })); },
    );
    return () => { cancelled = true; };
  }, [key, version]);

  const reload = useCallback(() => setVersion(value => value + 1), []);
  return { ...state, reload };
}

/** Chạy một thao tác ghi, theo dõi trạng thái đang xử lý và lỗi gần nhất. */
export function useAsyncAction<Args extends unknown[], R>(action: (...args: Args) => Promise<R>, onSuccess?: (result: R) => void) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<Error>();

  const run = useCallback(async (...args: Args) => {
    setRunning(true);
    setError(undefined);
    try {
      const result = await action(...args);
      onSuccess?.(result);
      return result;
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
      return undefined;
    } finally {
      setRunning(false);
    }
  }, [action, onSuccess]);

  return { run, running, error };
}
