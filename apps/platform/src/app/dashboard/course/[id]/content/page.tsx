import React from 'react';
import Header from '@/app/dashboard/_components/Header';
import { getModulesByCourseId } from '@/api/services/module';
import ContentTable from './_components/Content';

export default async function ContentManagementPage({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: Promise<{ status: string; createdAt: string; sort: string }>;
}): Promise<React.JSX.Element> {
  const { status, createdAt, sort } = await searchParams;

  const modules = await getModulesByCourseId(id, {
    status,
    createdAt,
    sort,
  });

  console.log(modules);

  return (
    <div>
      <Header
        subtitle="The central repository for all your course materials"
        title="Content Library"
      />
      <ContentTable modules={modules} />
    </div>
  );
}
