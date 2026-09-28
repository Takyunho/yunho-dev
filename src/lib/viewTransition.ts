// 목록의 제목과 상세 페이지의 제목을 한 이름으로 묶는다.
// 두 곳의 이름이 어긋나면 글자가 옮겨 가지 않고 그냥 사라졌다 나타난다
export function titleTransitionName(projectId: string): string {
  return `project-title-${projectId}`;
}
