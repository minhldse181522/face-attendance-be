// import {
//   Detail,
//   ImageDetail,
// } from '../command/create-image-storage/create-image-storage.request.dto';

// export function mergeDetails(detail1: Detail, detail2: Detail): Detail {
//   const merged: Detail = { ...detail1 };

//   for (const key in detail2) {
//     if (merged[key]) {
//       // Merge arrays and group by 'side'
//       const combined = [...merged[key], ...detail2[key]];
//       const groupedBySide: { [side: string]: ImageDetail } = {};

//       combined.forEach((item) => {
//         if (groupedBySide[item.side]) {
//           // Merge nameImage arrays and remove duplicates
//           groupedBySide[item.side].nameImage = Array.from(
//             new Set([...groupedBySide[item.side].nameImage, ...item.nameImage]),
//           );
//         } else {
//           groupedBySide[item.side] = { ...item };
//         }
//       });

//       merged[key] = Object.values(groupedBySide);
//     } else {
//       merged[key] = detail2[key];
//     }
//   }

//   return merged;
// }
