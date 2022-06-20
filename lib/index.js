/**
 * Index file for the use-captured-state package <br>
 * Contains everything ever needed to be imported from the package
 * @module use-captured-state
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Updates the value of a single key in the captured values object. <br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} updateKey
 * @param {string} key - Name passed into useCapturedState()
 * @param value - Value to update to at the given key
 */

/**
 * Updates multiple values in the captured values object at once. <br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} batchUpdateKeys
 * @param {Object} batchValues - Object to merge into the captured values object (name: value pairs)
 */

/**
 * Removes a single key and its value from the captured values object. <br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} removeKey
 * @param {string} key - Key to remove from the captured values object
 */

/**
 * Removes multiple keys and their values from the captured values object at once. <br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} batchRemoveKeys
 * @param {string[]} keyList - Array of keys to remove from the captured values object
 */

/**
 * Gets all the captured values from the context. <br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} getValues
 * @return {Object} Object containing all the values using the name argument from useCapturedState calls as keys
 */

/**
 * Forces entire context to rerender if needed. Recommended to be used on an input's onBlur<br>
 * Part of the return value of [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef {function} forceRerender
 * @param {boolean} [smart = true] - Will unconditionally rerender if set to false. Otherwise, only rerenders if a change has been made
 */

/**
 * Contains the captured value object and all the methods to modify it. <br>
 * Is the return value of the [useCapturedProviderValue() hook]{@link module:use-captured-state.useCapturedProviderValue}
 * @global
 * @typedef CaptureContextValue
 * @property {updateKey} updateKey - Function used to update a single key's value in the captured value object
 * @property {batchUpdateKeys} batchUpdateKeys - Function used to update a multiple keys' value in the captured value object
 * @property {removeKey} removeKey - Function used to remove a single keys and its value from the captured value object
 * @property {batchRemoveKeys} batchRemoveKeys - Function used to remove multiple keys and their values from the captured value object
 * @property {getValues} getValues - Returns an object with all the captured values stored in the context. Should only be modified using the other methods in this object. <br>
 *                             _Note: This will initially be an empty object and is only filled with default values on the second render!_
 * @property {forceRerender} forceRerender - Forces the entire context to rerender if a change has occurred. Optional parameter for unconditional rerenders.
 */

/** @type {CaptureContextValue} */
const captureDefaultValue = {
	updateKey: () => {},
	batchUpdateKeys: () => {},
	removeKey: () => {},
	batchRemoveKeys: () => {},
	getValues: () => {},
	forceRerender: () => {}
};

const CaptureContext = createContext(captureDefaultValue);

/**
 * Use this hook if using ImmediateCapturedProvider instead of CapturedProvider and pass the value as the value of ImmediateCapturedProvider
 * Allows the functional component that renders the ImmediateCapturedProvider to have access to the captured value object
 * @returns {CaptureContextValue} Object to pass to ImmediateCapturedProvider.value. Contains a value property with the captured value object
 */
export function useCapturedProviderValue() {
	// State used to force a rerender of the parent component by toggling back and forth. There's probably a better way
	const [render, setRender] = useState(false);

	// Directly modify the ref and change staleState's ref whenever a change has been made to prevent unnecessary re-renders
	const values = useRef({});
	const staleState = useRef(false);

	// Helper functions
	const makeStale = () => staleState.current = true;

	/** @type getValues */
	const getValues = () => values.current;

	/** @type forceRerender */
	const forceRerender = (smart = true) => {
		if(smart && !staleState.current) return;
		setRender(!render);
	};

	/** @type updateKey */
	const updateKey = (key, value) => {
		makeStale();
		values.current[key] = value;
	};

	/** @type batchUpdateKeys */
	const batchUpdateKeys = batchValues => {
		makeStale();
		for(const key in batchValues) {
			if(!batchValues.hasOwnProperty(key)) continue;
			const value = batchValues[key];
			updateKey(key, value);
		}
		return getValues();
	};

	/** @type removeKey */
	const removeKey = key => {
		if(!(key in values.current)) return;
		makeStale();
		delete values.current[key];
	};

	/** @type batchRemoveKeys */
	const batchRemoveKeys = keyList => {
		keyList.forEach(key => removeKey(key));
		return getValues();
	};

	/** @type {CaptureContextValue} */
	return {
		updateKey: updateKey,
		batchUpdateKeys: batchUpdateKeys,
		removeKey: removeKey,
		batchRemoveKeys: batchRemoveKeys,
		getValues: getValues,
		forceRerender: forceRerender
	};
}

/**
 * Container for all the elements that will use useCapturedState(). Will hold all the captured values from useCapturedState()
 * @param {CaptureContextValue} value - Context value. Obtain it with a call to [useCapturedProviderValue()]{@link module:use-captured-state.useCapturedProviderValue}.
 * @param {JSX.Element|string} children - Elements to render inside provider. These elements will have access to the captured values object through useCapturedState()
 * @returns {JSX.Element} Returns the provider that will contain a section a the page that uses useCapturedState()
 * @constructor
 */
export function ImmediateCapturedProvider({ value, children }) {
	return (
		<CaptureContext.Provider value={value}>
			{children}
		</CaptureContext.Provider>
	);
}

/**
 * Container for all the elements that will use useCapturedState(). Will hold all the captured values from useCapturedState(). <br>
 * Only difference between this and ImmediateCapturedProvider is that CapturedProvider does not allow the functional component rendering it to access the captured values object. <br>
 * Equivalent to an instance of `<ImmediateCapturedProvider value={useCapturedProviderValue()}>` (Open the source code. That's pretty much all this function is)
 * @param {JSX.Element|string} children - Elements to render inside provider. These elements will have access to the captured values object through useCapturedState()
 * @returns {JSX.Element} Returns the provider that will contain a section a the page that uses useCapturedState()
 * @constructor
 */
export function CapturedProvider({ children }) {
	const capturedProviderValue = useCapturedProviderValue();

	return (
		<ImmediateCapturedProvider value={capturedProviderValue}>
			{children}
		</ImmediateCapturedProvider>
	);
}

/**
 * Returns the captured values object from the nearest provider. Does not automatically rerender unless forceRerender() is called
 * @returns {Object} Captured values object (Read-only)
 */
export function useCapturedValues() {
	return useCaptureContextValue().getValues();
}

/**
 * Returns the entire CaptureContextValue object with read and write permission to the captured values object
 * @returns {CaptureContextValue} Use to read and modify the containing captured values context
 */
export function useCaptureContextValue() {
	return useContext(CaptureContext);
}

/**
 * A hook similar to useState that allows a component to edit a specific key in the captured value object and allow access to it by anything above it
 * @param {string} name - Name of the captured state. Used as a key in the captured values object
 * @param {string|*} [defaultValue=""] Default value to set as the state. Similar to first argument of useState()
 * @returns {Array.<(string|*),(function(*): void)>} Return value is similar to useState(). An array with [value, setValue] as its entries
 */
export function useCapturedState(name, defaultValue = "") {
	const [capturedState, setCapturedState] = useState(defaultValue);
	const capturedProviderValue = useCaptureContextValue();

	useEffect(() => {
		capturedProviderValue.updateKey(name, capturedState);
	}, [capturedState]);

	return [capturedState, setCapturedState];
}

// Duplicate export as default for backwards compatibility (Deprecated - Import by name instead)
export default useCapturedState;