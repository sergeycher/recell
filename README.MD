# Reactive Cell library

Very simple low-level reactive programming library based on excel-like cells

```typescript
import {recell} from "./recell";

const a = recell(0);
const b = recell(0);
// watch a and b explicitly
const ab = recell(0).compute(() => a.value + b.value).watch(a, b);

a.next(12);
b.next(8);

console.log(ab.value); // 20
```
