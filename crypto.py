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

#######################################

def inverse_matrix(matrix):
    rows, cols = len(matrix), len(matrix[0])

    # Augment the matrix with the identity matrix
    augmented_matrix = [row + [1 if i == j else 0 for j in range(rows)] for i, row in enumerate(matrix)]

    # Perform Gauss-Jordan elimination
    for col in range(cols):
        # Find the pivot row
        pivot_row = max(range(col, rows), key=lambda i: abs(augmented_matrix[i][col]))

        # Check if the pivot element is zero
        if augmented_matrix[pivot_row][col] == 0:
            return None

        # Swap the current row with the pivot row
        augmented_matrix[col], augmented_matrix[pivot_row] = augmented_matrix[pivot_row], augmented_matrix[col]

        # Scale the pivot row to make the pivot element 1
        pivot_element = augmented_matrix[col][col]
        augmented_matrix[col] = [element / pivot_element for element in augmented_matrix[col]]

        # Eliminate other rows
        for i in range(rows):
            if i != col:
                factor = augmented_matrix[i][col]
                augmented_matrix[i] = [a - b * factor for a, b in zip(augmented_matrix[i], augmented_matrix[col])]

    # Extract the inverse matrix from the augmented matrix
    inverse_matrix = [row[cols:] for row in augmented_matrix]

    return inverse_matrix

def gen_matrix(size,perma_seed=None):
    seed(perma_seed)
    matrix = -1
    while matrix == -1 or inverse_matrix(matrix) == None:
        matrix = [choices([1, 2, 3, 4, 5, 6, 7, 8, 9], k=size) for i in range(size)]
    return matrix

def matrix_encrypt(message, matrix):
    size = len(matrix)
    message_ascii = [ord(char) for char in message]
    padded_message_ascii = message_ascii + [0] * (size - len(message_ascii) % size)

    encrypted_message = []
    for i in range(0,len(padded_message_ascii),size):
        chunk = padded_message_ascii[i:i+size]
        encrypted_chunk = [sum([row[i]*chunk[i] for i in range(size)]) for row in matrix]
        encrypted_chunk = [(int((x-x%256)/256),x%256) for x in encrypted_chunk]
        encrypted_message.extend(encrypted_chunk)

    return ''.join(map(lambda x: str(x[0]) + chr(x[1]), encrypted_message))

def matrix_decrypt(encrypted_message, matrix):
    size = len(matrix)
    matrix_inverse = inverse_matrix(matrix)
    try:
        encrypted_message_ascii = [256*int(encrypted_message[i])+ord(encrypted_message[i+1]) for i in range(0,len(encrypted_message),2)]
    except ValueError as e:
        print(len(encrypted_message), encrypted_message)
        raise TypeError('MATRIX ERROR HAPPENED')

    decrypted_message = []
    for i in range(0,len(encrypted_message_ascii),size):
        chunk = encrypted_message_ascii[i:i+size]
        decrypted_chunk = [round(sum([row[i]*chunk[i] for i in range(size)])) for row in matrix_inverse]
        decrypted_message.extend(decrypted_chunk)

    i = len(decrypted_message) - 1
    while i >= 0 and decrypted_message[i] == 0:
        i -= 1
    decrypted_message = decrypted_message[:i + 1]

    return ''.join(map(chr, decrypted_message))

if __name__=='__main__':
    h=get_hash('yasseen')
    print(h)
    print(check_hash(h,'yasseen'))
    
    matrix = gen_matrix(2)
    original_message = "Hello, World!"
    encrypted_message = matrix_encrypt(original_message, matrix)
    decrypted_message = matrix_decrypt(encrypted_message, matrix)
    print(f"Encrypted message: {encrypted_message}")
    print(f"Decrypted message: {decrypted_message}")