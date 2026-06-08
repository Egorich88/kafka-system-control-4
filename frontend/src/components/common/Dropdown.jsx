/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


 import { useState, useEffect, useRef } from 'react';
 import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

 import '../../styles/dropdown.css';

 export default function Dropdown({
   selectedItem,
   items,
   onSelect,
   addLabel,
   onAdd,
   statusResolver
 }) {
   const [isOpen, setIsOpen] = useState(false);

   const dropdownRef = useRef(null);

   useEffect(() => {
     function handleClickOutside(event) {
       if (
         dropdownRef.current &&
         !dropdownRef.current.contains(event.target)
       ) {
         setIsOpen(false);
       }
     }

     document.addEventListener(
       'mousedown',
       handleClickOutside
     );

     return () => {
       document.removeEventListener(
         'mousedown',
         handleClickOutside
       );
     };
   }, []);

   return (
     <div
       className="dropdown-wrapper"
       ref={dropdownRef}
     >

       <button
         type="button"
         className={`dropdown-selected ${
           isOpen ? 'open' : ''
         }`}
         onClick={() => setIsOpen(!isOpen)}
       >

         <div className="dropdown-selected-left">

           {
             statusResolver && (
               <div
                 className={`dropdown-status-dot ${
                   statusResolver(selectedItem)
                 }`}
               />
             )
           }

           <span className="dropdown-selected-name">
             {selectedItem.name}
           </span>

         </div>

         <div className="dropdown-chevron">
           {isOpen
             ? <FiChevronUp />
             : <FiChevronDown />
           }
         </div>

       </button>

       {isOpen && (
         <div className="dropdown-menu">

           {items.map(item => (
             <div
               key={item.id}
               className="dropdown-item"
               onClick={() => {
                 onSelect(item);
                 setIsOpen(false);
               }}
             >

               {
                 statusResolver && (
                   <div
                     className={`dropdown-status-dot ${
                       statusResolver(item)
                     }`}
                   />
                 )
               }

               <span>
                 {item.name}
               </span>

             </div>
           ))}

           {onAdd && (
             <div
               className="dropdown-add"
               onClick={() => {
                 setIsOpen(false);
                 onAdd();
               }}
             >
               {addLabel}
             </div>
           )}

         </div>
       )}

     </div>
   );
 }