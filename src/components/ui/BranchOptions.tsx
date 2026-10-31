// src/components/ui/BranchOptions.tsx
import React from 'react';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode } from '@/types';

interface BranchOptionsProps {
  branchesByScope: Record<ServiceTypeCode, string[]>;
  /** Hanya cabang lingkup ini (tanpa pengelompokan); kosong = semua lingkup per grup */
  scope?: ServiceTypeCode | '';
}

/** `<option>` cabang untuk `<select>`, dikelompokkan per lingkup layanan DSC/ASC/SL. */
export const BranchOptions: React.FC<BranchOptionsProps> = ({ branchesByScope, scope = '' }) => {
  const renderOptions = (names: string[]) =>
    names.map((branch) => (
      <option key={branch} value={branch}>
        {branch}
      </option>
    ));

  if (scope) return <>{renderOptions(branchesByScope[scope] ?? [])}</>;

  return (
    <>
      {SERVICE_SCOPES.filter((s) => (branchesByScope[s.code] ?? []).length > 0).map((s) => (
        <optgroup key={s.code} label={`${s.code}, ${s.fullName}`}>
          {renderOptions(branchesByScope[s.code])}
        </optgroup>
      ))}
    </>
  );
};
