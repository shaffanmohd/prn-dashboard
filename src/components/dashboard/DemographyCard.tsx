// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import type { SeatDemography } from "@/types/election";

// interface Props {
//   demography: SeatDemography;
// }

// function EthnicBar({
//   label,
//   pct,
//   color,
// }: {
//   label: string;
//   pct: number;
//   color: string;
// }) {
//   return (
//     <div>
//       <div className="flex justify-between text-xs mb-1">
//         <span className="text-muted-foreground">{label}</span>
//         <span className="font-mono">{pct}%</span>
//       </div>
//       <div className="h-1.5 bg-muted rounded-full overflow-hidden">
//         <div
//           className={`h-full rounded-full ${color}`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }

// export function DemographyCard({ demography: d }: Props) {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Card className="cursor-pointer hover:shadow-md transition-shadow">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>District demography</CardTitle>
//               <span className="text-xs text-blue-600">View detail →</span>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {d.district} district · source: DOSM
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div>
//                 <p className="text-xs text-muted-foreground">Population</p>
//                 <p className="font-semibold">{d.population.toLocaleString()}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground">Median age</p>
//                 <p className="font-semibold">{d.medianAge}</p>
//               </div>
//               {d.medianIncome && (
//                 <div>
//                   <p className="text-xs text-muted-foreground">Median income</p>
//                   <p className="font-semibold">
//                     RM {d.medianIncome.toLocaleString()}
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div className="space-y-2 pt-1">
//               <EthnicBar
//                 label="Malay"
//                 pct={d.ethnicity.malay}
//                 color="bg-blue-400"
//               />
//               <EthnicBar
//                 label="Chinese"
//                 pct={d.ethnicity.chinese}
//                 color="bg-red-400"
//               />
//               <EthnicBar
//                 label="Indian"
//                 pct={d.ethnicity.indian}
//                 color="bg-amber-400"
//               />
//               <EthnicBar
//                 label="Other"
//                 pct={d.ethnicity.other}
//                 color="bg-gray-400"
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </DialogTrigger>

//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{d.district} — full breakdown</DialogTitle>
//           <DialogDescription>
//             District-level data · source: DOSM open data catalogue
//           </DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <p className="text-xs text-muted-foreground">District</p>
//               <p className="font-semibold">{d.district}</p>
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Population</p>
//               <p className="font-semibold">{d.population.toLocaleString()}</p>
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Median age</p>
//               <p className="font-semibold">{d.medianAge}</p>
//             </div>
//             {d.medianIncome && (
//               <div>
//                 <p className="text-xs text-muted-foreground">Median income</p>
//                 <p className="font-semibold">
//                   RM {d.medianIncome.toLocaleString()}
//                 </p>
//               </div>
//             )}
//           </div>
//           <div className="space-y-3">
//             <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//               Ethnic composition
//             </p>
//             <EthnicBar
//               label="Malay"
//               pct={d.ethnicity.malay}
//               color="bg-blue-400"
//             />
//             <EthnicBar
//               label="Chinese"
//               pct={d.ethnicity.chinese}
//               color="bg-red-400"
//             />
//             <EthnicBar
//               label="Indian"
//               pct={d.ethnicity.indian}
//               color="bg-amber-400"
//             />
//             <EthnicBar
//               label="Other"
//               pct={d.ethnicity.other}
//               color="bg-gray-400"
//             />
//           </div>
//           <p className="text-xs text-muted-foreground">
//             Note: District boundaries do not align exactly to DUN boundaries.
//             Data is indicative only.
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
