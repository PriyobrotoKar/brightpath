import React from 'react';
import Header from '@/app/dashboard/_components/Header';
import { getModulesByCourseId } from '@/api/services/module';
import Content from './_components/Content';

export default async function ContentManagementPage({
  params: { id },
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const modules = await getModulesByCourseId(id);

  return (
    <div>
      <Header
        subtitle="The central repository for all your course materials"
        title="Content Library"
      />
      <Content modules={modules} />
    </div>
  );
}
