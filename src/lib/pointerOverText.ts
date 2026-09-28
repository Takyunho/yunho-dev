function caretAt(x: number, y: number): { node: Node; offset: number } | null {
  // Firefox에만 caretPositionFromPoint가 있고 나머지는 caretRangeFromPoint를 쓴다
  if (typeof document.caretPositionFromPoint === "function") {
    const position = document.caretPositionFromPoint(x, y);
    return position
      ? { node: position.offsetNode, offset: position.offset }
      : null;
  }
  if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(x, y);
    return range
      ? { node: range.startContainer, offset: range.startOffset }
      : null;
  }
  return null;
}

/**
 * 그 점에 글자가 실제로 찍혀 있는지 본다.
 *
 * 문단의 빈 오른쪽이나 줄 사이를 눌러도 브라우저는 가장 가까운 글자의 자리를 돌려준다.
 * 그래서 돌려받은 글자 한 칸을 다시 재서, 누른 점이 그 칸 안에 들었는지까지 확인해야 한다.
 */
export function isPointerOverText(x: number, y: number): boolean {
  const caret = caretAt(x, y);
  if (!caret || caret.node.nodeType !== Node.TEXT_NODE) return false;

  const length = caret.node.textContent?.length ?? 0;
  if (length === 0) return false;

  const glyph = document.createRange();
  const offset = Math.min(caret.offset, length - 1);
  glyph.setStart(caret.node, offset);
  glyph.setEnd(caret.node, offset + 1);
  const box = glyph.getBoundingClientRect();

  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}
