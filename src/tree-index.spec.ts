import 'should';
import {TreeIndex} from "./tree-index";

describe('Tree index', () => {
  it('should change', async () => {
    const index = new TreeIndex<string>();

    index.branch('a', 'b', 'c').value = ['1'];
    index.branch('a', 'b', 'd').value = ['2'];
    index.branch('b', 'b', 'd').value = ['3'];

    index.map(i => i).join('').should.be.exactly('123');

    index.branch('a', 'b').value.should.have.length(0);
    index.branch('b', 'b').value.should.have.length(0);

    index.branch('a').map(i => i).join('').should.be.exactly('12');
  })
});
