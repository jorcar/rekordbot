export function describeRank(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈 2nd';
    case 3:
      return '🥉 3rd';
    default:
      return undefined;
  }
}
