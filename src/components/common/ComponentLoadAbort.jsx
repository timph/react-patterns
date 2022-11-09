import { useEffect, useRef } from 'react';
/**
 * This shows a valid pattern against antipattern that checks for isMounted component to not
 * do something.
 */
function ComponentLoadAbort () {
  const [data, setData] = useState();

  // use useRef so that this value does not change between rerenders
  // not using useState because that would cause a re-render
  const loadDataAbortControllerRef = useRef();

  useEffect(() => {
    return () => { // Abort the request during cleanup
      if (loadDataAbortControllerRef.current) {
        loadDataAbortControllerRef.current.abort();
      }
    };
  }, []);

  // This might be called anywhere, in a useEffect,
  // in an event handler for a button click, etc
  const loadData = () => {
    loadDataAbortControllerRef.current = new AbortController();
    const signal = loadDataAbortControllerRef.current.signal;
    fetch('http://some-url/to-get-data', { signal })
      .then(r => r.json())
      .then(data => {
        setData(data);
      });
  }

  // If the fetch call is in useEffect() only, this is simplier
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetch('http://some-url/to-get-data', { signal })
      .then(r => r.json())
      .then(data => {
        setData(data);
      });
    // Abort during cleanup
    return () => {
      abortController.abort();
    };
  }, []);

  return null;
}