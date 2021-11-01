import { useRef } from 'react';
import { useFluxible } from 'fluxible-addons-react';
import { addItem } from './actions';

const Input = () => {
    const ref = useRef();
    const { executeAction } = useFluxible();

    return (
        <div>
            <input ref={ref} />
            <button
                onClick={() => {
                    executeAction(addItem, { label: ref.current.value });
                    ref.current.value = '';
                }}
            >
                Add item
            </button>
        </div>
    );
};

export default Input;
