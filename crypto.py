from random import seed, choices

chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

def get_salt(length=5):
    seed()
    return ''.join(choices(chars,k=length))

def get_hash(password,salt=get_salt()):
    s=salt+password
    sum=0
    ascii_sum=''
    freq={}
    for i,c in enumerate(s):
        if c in freq:
            freq[c]+=1
        else:
            freq[c]=1
        sum+=(i+1)*ord(c)+freq[c]
    for c in freq.keys():
        ascii_sum+=str(ord(c))
    n=int(len(s)*sum+int(ascii_sum))%int('9'*30)
    return salt+'&'+str(n)

def check_hash(hash,password):
    s,h=hash.split('&')
    return h == get_hash(password,s).split('&')[1]

if __name__=='__main__':
    h=get_hash('yasseen')
    print(h)
    print(check_hash(h,'yasseen'))