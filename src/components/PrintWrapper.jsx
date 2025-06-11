import React, { useLayoutEffect } from 'react';

const PrintWrapper = ({ printReady, children }) => {
  useLayoutEffect(() => {
    if (printReady) {
      document.body.classList.add('print-ready');
    } else {
      document.body.classList.remove('print-ready');
    }
    return () => document.body.classList.remove('print-ready');
  }, [printReady]);

  return <div className={printReady ? 'print-ready' : ''}>{children}</div>;
};

export default PrintWrapper;
