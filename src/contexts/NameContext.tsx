import { createContext, useContext } from 'react';

/**
 * Provides a display-name mapper so participants can be renamed in results.
 * Default identity: returns the name unchanged.
 */
const NameContext = createContext<(name: string) => string>(n => n);

export const NameProvider = NameContext.Provider;
export const useDisplayName = () => useContext(NameContext);
