export enum PROFILE_STATUS {
  ACTIVE = 'Active',
  EMAIL_SENT = 'Email Sent',
  NONE = 'None',
}

export type DeletedType = {
  deleted: boolean;
};

export type SetDeletedType = (profileId: string) => DeletedType;

export const baseFilters: {
  setDeleted: DeletedType;
  setDeletedAndDeletedBy: SetDeletedType;
  filterDeleted: DeletedType;
} = {
  setDeleted: { deleted: true },
  setDeletedAndDeletedBy: (profileId: string) => ({
    deleted: true,
    deletedBy: profileId,
  }),
  filterDeleted: { deleted: false },
};