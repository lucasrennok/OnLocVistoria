import { isValidCnpj, isValidCpf, isValidCpfOrCnpj, maskCpfCnpj, onlyDigits } from './cpf-cnpj';

describe('cpf-cnpj utils', () => {
  it('valida CPF com dígitos verificadores corretos', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123')).toBe(false);
  });

  it('valida CNPJ com dígitos verificadores corretos', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('11222333000181')).toBe(true);
    expect(isValidCnpj('11.111.111/1111-11')).toBe(false);
    expect(isValidCnpj('123')).toBe(false);
  });

  it('valida CPF ou CNPJ conforme o tipo', () => {
    expect(isValidCpfOrCnpj('111.444.777-35', 'CPF')).toBe(true);
    expect(isValidCpfOrCnpj('111.444.777-35', 'CNPJ')).toBe(false);
    expect(isValidCpfOrCnpj('11.222.333/0001-81', 'CNPJ')).toBe(true);
    expect(isValidCpfOrCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('529.982.247-25')).toBe('52998224725');
    expect(onlyDigits('(19) 99999-0000')).toBe('19999990000');
  });

  it('aplica máscara de CPF e CNPJ', () => {
    expect(maskCpfCnpj('11144477735')).toBe('111.444.777-35');
    expect(maskCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(maskCpfCnpj('111')).toBe('111');
  });
});
