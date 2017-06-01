import chai from 'chai';

const expect = chai.expect;

describe('Mocha-Chai [test]', function () {
  it('should confirm the install and config of both libraries', function () {
    const emptied = {};
    const nada = null;
    const chimeraScale = [-1, 0, 1];
    const data = {
      id: '3',
      config: {
        s: 0,
        d: 1,
        n: 1,
        always: true,
      },
    };

    expect(emptied).to.be.empty;
    expect(nada).to.be.null;
    expect(chimeraScale).to.have.lengthOf(3);
    expect(data).to.deep.equal({ id: '3', config: { s: 0, d: 1, n: 1, always: true } });
  });
});
