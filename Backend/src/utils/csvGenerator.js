const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
};

const generateActivityCSV = (activity, students) => {
  // Template order: identity columns first, then teacher scoring parameters.
  const headers = ['Name', 'Roll No', 'Email'];
  const rubricHeaders = (activity.rubrics || []).map(r => r.criteria);

  headers.push(...rubricHeaders);
  headers.push('Total', 'Overall Feedback');

  const rows = [headers.join(',')];

  students.forEach(student => {
    const row = [
      escapeCsvValue(student.name),
      escapeCsvValue(student.rollNo || ''),
      escapeCsvValue(student.email),
      ...(activity.rubrics || []).map(() => '0'),
      '0',
      escapeCsvValue('')
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
};

export { generateActivityCSV };