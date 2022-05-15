import { createContext, useContext, useEffect, useState } from "react";

/**
 * Contains the captured value object and all the methods to modify it. <br>
 * Is the return value of the [useCapturedProviderValue() hook]{@link useCapturedProviderValue}
 * @typedef {Object} CaptureContextValue
 * @property {Object} values - The captured values stored in the context. Should only be modified using the other methods in this object. <br>
 *                             _Note: This will initially be an empty object and is only filled with default values on the second render!_
 * @property {updateKey} updateKey - Function used to update a single key's value in the captured value object
 * @property {batchUpdateKeys} batchUpdateKeys - Function used to update a multiple keys' value in the captured value object
 * @property {removeKey} removeKey - Function used to remove a single keys and its value from the captured value object
 * @property {batchRemoveKeys} batchRemoveKeys - Function used to remove multiple keys and their values from the captured value object
 */

/** @type {CaptureContextValue} */
const captureDefaultValue = {
	updateKey: () => {},
	batchUpdateKeys: () => {},
	removeKey: () => {},
	batchRemoveKeys: () => {},
	values: {}
}

const CaptureContext = createContext(captureDefaultValue);

/**
 * Use this hook if using ImmediateCapturedProvider instead of CapturedProvider and pass the value as the value of ImmediateCapturedProvider
 * Allows the functional component that renders the ImmediateCapturedProvider to have access to the captured value object
 * @returns {CaptureContextValue} Object to pass to ImmediateCapturedProvider.value. Contains a value property with the captured value object
 */
export function useCapturedProviderValue() {
	const [capturedValues, setCapturedValues] = useState({});

	/**
	 * Updates the value of a single key in the captured values object. <br>
	 * Part of the return value of [useCapturedProviderValue()]{@link useCapturedProviderValue}
	 * @name updateKey
	 * @function updateKey
	 * @param {string} key - Name passed into useCapturedState()
	 * @param value - Value to update to at the given key
	 */
	const updateKey = (key, value) => {
		setCapturedValues(oldState => {
			const newValue = { ...oldState };
			newValue[key] = value;
			return newValue;
		});
	};

	/**
	 * Updates multiple values in the captured values object at once. <br>
	 * Part of the return value of [useCapturedProviderValue()]{@link useCapturedProviderValue}
	 * @name batchUpdateKeys
	 * @function batchUpdateKeys
	 * @param {Object} batchValues - Object to merge into the captured values object (name: value pairs)
	 */
	const batchUpdateKeys = batchValues => {
		setCapturedValues(oldState => {
			const newValue = { ...oldState };
			for(const key of batchValues) {
				if(!batchValues.hasOwnProperty(key)) continue;
				newValue[key] = batchValues[key];
			}
			return newValue;
		});
	};

	/**
	 * Removes a single key and its value from the captured values object. <br>
	 * Part of the return value of [useCapturedProviderValue()]{@link useCapturedProviderValue}
	 * @name removeKey
	 * @function removeKey
	 * @param {string} key - Key to remove from the captured values object
	 */
	const removeKey = key => {
		setCapturedValues(oldState => {
			const newValue = { ...oldState };
			delete newValue[key];
			return newValue;
		});
	};

	/**
	 * Removes multiple keys and their values from the captured values object at once. <br>
	 * Part of the return value of [useCapturedProviderValue()]{@link useCapturedProviderValue}
	 * @name batchRemoveKeys
	 * @function batchRemoveKeys
	 * @param {string[]} keyList - Array of keys to remove from the captured values object
	 */
	const batchRemoveKeys = keyList => {
		setCapturedValues(oldState => {
			const newValue = { ...oldState };
			keyList.forEach(key => delete newValue[key]);
			return newValue;
		});
	};

	/** @type {CaptureContextValue} */
	return {
		updateKey: updateKey,
		batchUpdateKeys: batchUpdateKeys,
		removeKey: removeKey,
		batchRemoveKeys: batchRemoveKeys,
		values: capturedValues
	};
}

/**
 * Container for all the elements that will use useCapturedState(). Will hold all the captured values from useCapturedState()
 * @param {CaptureContextValue} value - Context value. Obtain it with a call to [useCapturedProviderValue()]{@link useCapturedProviderValue}.
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
 * Returns the captured values object from the nearest provider.
 * @returns {CaptureContextValue.value} Captured values object (Read-only)
 */
export function useCapturedValues() {
	return useCaptureContextValue().values;
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
export default function useCapturedState(name, defaultValue = "") {
	const capturedProviderValue = useCaptureContextValue();
	const { values, updateKey } = capturedProviderValue;
	const defined = (name in values);

	useEffect(() => {
		updateKey(name, defaultValue);
	}, []);

	return [defined ? values[name] : defaultValue, val => updateKey(name, val)];
}