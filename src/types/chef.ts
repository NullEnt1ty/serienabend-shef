export type Chef = {
  id: number;
  name: string;
  points: number;
};

export type AddChef = Omit<Chef, 'id'>;
