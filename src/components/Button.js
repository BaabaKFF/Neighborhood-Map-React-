import React from "react";
// Chevrons used in Button component from `react-fontawesome`
import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(faChevronDown, faChevronUp); // not sure if this is needed, necessarily

// functional stateless component, with prop names defined as arguments to the arrow function.
// This component accepts a variety of props dependent on the invoking parent component. 
export const Button = ({
  btnClass,
  ariaLabel,
  handleToggle,
  shown,
  ariaState,
  fntAweArrCls,
  tabIndex,
  arrowSize
}) => {
  return (
    <button
      className={btnClass}
      onClick={handleToggle}
      aria-label={ariaLabel}
      aria-pressed={ariaState}
      tabIndex={tabIndex}
    >
      <FontAwesomeIcon
        className={fntAweArrCls}
        size={arrowSize}
        aria-hidden="true"
        icon={shown ? faChevronDown : faChevronUp} // Quick way to change icons
      />
    </button>
  );
};
