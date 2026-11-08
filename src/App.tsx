import './App.css'; 


// import React from 'react';
import { MainAppHub } from './components/MainAppHub/MainAppHub';

function App() {
  return <MainAppHub />;
}

export default App;






// import React, { useState } from 'react';
// import { EquipmentCard } from './components/EquipmentCard/EquipmentCard';
// import { EquipmentData } from './models/equipment';
// import './App.css';

// function App() {
//   // Тестируем один Astral Sword
//   const [item, setItem] = useState(
//     new EquipmentData('1-AstralSword', 'sword', 'astral', 'no')
//   );

//   const handleGradeChange = (nextGrade: any) => {
//     setItem(prev => prev.clone({ grade: nextGrade }));
//   };

//   return (
//     <div style={{ 
//       background: '#1a1a2e', 
//       minHeight: '100vh', 
//       display: 'flex', 
//       flexDirection: 'column',
//       alignItems: 'center', 
//       justifyContent: 'center',
//       gap: '20px'
//     }}>
//       <h2 style={{ color: '#e6a817', fontFamily: 'sans-serif' }}>Тест карточки снаряжения</h2>
      
//       {/* Контейнер для проверки фиксированной ширины */}
//       <div style={{ width: '195px' }}>
//         <EquipmentCard 
//           equipment={item} 
//           onChangeGrade={handleGradeChange} 
//         />
//       </div>

//       <div style={{ color: '#b0b0c0', fontSize: '14px', fontFamily: 'sans-serif' }}>
//         Текущий грейд: <strong style={{ color: '#fff' }}>{item.grade}</strong>
//       </div>
//     </div>
//   );
// }

// export default App;
















// import React, { useState } from 'react';
// import { SlimeCard } from './components/SlimeCard/SlimeCard';
// import { createInitialSlimes, type SlimeState, SlimeData } from './models/slime';

// function App() {
//   const initialSlimes = createInitialSlimes();
//   const targetSlime = initialSlimes.find(s => s.order === 27) || initialSlimes[0];
//   const [slime, setSlime] = useState<SlimeData>(targetSlime);

//   const handleChangeState = (newState: SlimeState) => {
//     setSlime(prevSlime => prevSlime.clone({ _state: newState }));
//   };

//   const handleChangeLevel = (newLevel: number) => {
//     setSlime(prevSlime => {
//       const cloned = prevSlime.clone({});
//       cloned.level = newLevel;
//       return cloned;
//     });
//   };

//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '100vh',
//       backgroundColor: '#1a1a1a',
//       color: '#ffffff',
//       gap: '20px'
//     }}>
//       <h2>Wynne (Ширина: 100px)</h2>
      
//       {/* Передаем внешнюю ширину карточки */}
//       <SlimeCard 
//         slime={slime}
//         width={333} 
//         onChangeState={handleChangeState}
//         onChangeLevel={handleChangeLevel}
//       />
//     </div>
//   );
// }

// export default App;




