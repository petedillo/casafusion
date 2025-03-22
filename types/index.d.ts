import { User, Household, HouseholdMember, JoinRequest } from "@prisma/client";

export type UserWithRelations = User & {
  households?: (HouseholdMember & {
    household: Household;
  })[];
  joinRequests?: JoinRequest[];
};

export type HouseholdWithRelations = Household & {
  members?: (HouseholdMember & {
    user: User;
  })[];
  joinRequests?: (JoinRequest & {
    user: User;
  })[];
};

export type JoinRequestWithRelations = JoinRequest & {
  user: User;
  household: Household;
};

export type HouseholdMemberWithRelations = HouseholdMember & {
  user: User;
  household: Household;
}; 