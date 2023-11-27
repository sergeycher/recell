import {recell, Recell} from "./recell";
import 'should';

describe('Reactive cell', () => {
  it('should recalc', async () => {
    const username = recell('');
    const password = recell('');
    const confirm = recell(false);

    const hash = new Recell('').compute(() => {
      if (!confirm.value) {
        return '';
      }

      return username.value + ':' + password.value;
    }).watch(username, password, confirm);

    hash.value.should.be.exactly('');

    username.value = 'u';
    password.value = 'p';
    hash.value.should.be.exactly('');

    confirm.value = true;
    hash.value.should.be.exactly('u:p');
  });

  it('should watch and unwatch', () => {
    const a = recell(1);
    const b = recell(2);
    const ab = recell(0).compute(() => a.value * b.value);

    ab.value.should.be.exactly(2);
    a.value = 5;
    b.value = 4;
    ab.value.should.be.exactly(2);

    ab.watch(a, b).value.should.be.exactly(20);

    ab.unwatch(a, b).value.should.be.exactly(20);
    a.value = 3;
    b.value = 4;
    ab.value.should.be.exactly(20);

    ab.watch(a, b).value.should.be.exactly(12);
  });

  it('should map', () => {
    const a = recell(1);
    const b = a.map((v) => v * 3);

    b.value.should.be.exactly(3);
    a.value = 3;
    b.value.should.be.exactly(9);
    b.unwatch(a);
    a.value = 5;
    b.value.should.be.exactly(9);
    b.obsolete().value.should.be.exactly(15);
  });
});
