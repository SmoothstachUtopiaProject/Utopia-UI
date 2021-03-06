import React, { useCallback, useEffect, useRef, useState }  from 'react';
import FocusLock from './FocusLock';

const ESCAPE_KEY = 27;

const DropDown = (props) => {
  // @PROP: align - string
  // @PROP: buttonClassName - string
  // @PROP: options - [string]
  // @PROP: optionsName - string
  // @PROP: selection - string
  // @PROP: type - string

  // @PROP: isActive - bool
  // @PROP: onSelect - f()

  const { isActive, options, selection } = props;
  const [isDropDownActive, setDropDownActive] = useState(isActive || false);
  const rootNode = useRef(null);

  const handleSelect = useCallback((value) => {
    if(props.onSelect && value) props.onSelect(value);
    setDropDownActive(false);
  }, [props]);

  // Escape Key Listener
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { keyCode } = event;
      if (keyCode === ESCAPE_KEY) {
        event.preventDefault();
        handleSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSelect]);

  // MouseDown & TouchDown Outside Element Listener
  useEffect(() => {
    const handleClick = (event) => {
      const { target } = event;
      if(rootNode.current && !rootNode.current.contains(target)) {
        handleSelect(null);
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('touchdown', handleClick);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('touchdown', handleClick);
    };
  }, [rootNode, handleSelect]);

  let optionsRender = [];
  if(options) {
    if(options.length) {
      for(const i in options) {
        if(options[i]) {
          const option = options[i];
          const optionRender =
          <li key={"option-" + i}><button 
            className={"dropdown-item " + (selection === option && "active")}
            type="button"
            onClick={() => handleSelect(option)}
          >
            {option + (props.optionsName ? (" " + props.optionsName) : "")}
          </button></li>;
          optionsRender.push(optionRender);
        }
      }
    } else {
      optionsRender =
      <li>
        <button
          className={"dropdown-item " + (selection === options && "active")}
          type="button"
          onClick={() => handleSelect(options)}
        >
          {options + (props.optionsName ? (" " + props.optionsName) : "")}
        </button>
      </li>;
    }
  } else {
    optionsRender = options === "PENDING"
      ? <div className="spinner-border"/>
      : <div>{"No options available."}</div>;
  }

  return (
    <div className={"drop" +
      (props.type || "down") + " " +
      (props.className || "")}
      style={props.style}
      ref={rootNode}
    >
      <FocusLock props={{isLocked: !isDropDownActive}}>
        <button
          className={"btn w-100 " + (props.buttonClassName || "")}
          style={{textAlign:"left"}}
          type="button"
          onClick={() => setDropDownActive(true)}
        >
          {selection ? (selection + (props.optionsName ? (" " + props.optionsName) : "")) : "No selection available."}
        </button>
        <ul className={"dropdown-menu " +
          (props.align ? "dropdown-menu-" + props.align : "")+ " " +
          ((isDropDownActive || props.isActive) ? "show" : "")}
        >
          {optionsRender}
        </ul>
      </FocusLock>
    </div>
  );
}
export default DropDown;
