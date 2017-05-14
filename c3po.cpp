#include <iostream>
#include <string>
#include <vector>
#include <sstream>


/* To do:
 * Move to async websocket
 * Read from stdin on a seperate thread, then from that thread send any data to main as a string */
//typedef std::vector<std::string> str_vec;
std::string encode(std::vector<std::string> vec) {
    std::string fin("");
    for(int i = 0; i < vec.size();++i) {
        fin += std::to_string(vec[i].length());
        fin += '.';
        fin += vec[i];
        if(i != vec.size() - 1)
            fin += ',';
    }
    fin += ';';
    return fin;
}


std::vector<std::string> decode(std::string str) {
    std::vector<std::string> decoded;
    std::stringstream ss;
    ss << str;
    for(int i = 0; i < str.length();++i) {
        char testChar;
        ss >> testChar;
        int ssCountOriginal = static_cast<int>(ss.tellg()) - 1, wordLength{0};
        switch(testChar) {
            case '0': case '1': case '2': case '3':
            case '4': case '5': case '6': case '7':
            case '8': case '9':
                ss.putback(testChar);
               
                ss >> wordLength;
                
                // Skip length of number plus the period
                i += (static_cast<int>(ss.tellg()) - ssCountOriginal) + 1;

                // Sync buffer
                ss >> testChar;
                break;
            default: throw std::runtime_error("Something happened :(");
        }
        std::string word("");
        for(int k = i;k < i + wordLength;++k) word += ss.get();
        decoded.push_back(word);

        // Advance stream and i one
        i += wordLength + 1;
        ss >> testChar;
    }
    return decoded;
}
