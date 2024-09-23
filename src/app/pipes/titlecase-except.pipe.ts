import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'titlecaseExcept'
})
export class TitlecaseExceptPipe implements PipeTransform{
    except:string[] = []; 
    transform(value: string){ // accepts any number of arguments
        this.except = ["a", "and", "an", "or", "the", "but", "not", "for"];
        if(!value) return null;

        let words = value.split(/([\s\/]+)/);
        for (var index = 0; index < words.length; index++) {
        var word = words[index];
        if (index > 0 && this.isPreposition(word)) {
            words[index] = word.toLowerCase();
        }
        else {
            words[index] = this.toTitleCase(word);
        }
        }

        return words.join("");
    }
    private isPreposition = (word: string):boolean => {
        let lowerCaseWords  = [...this.except];
        return lowerCaseWords.includes(word.toLowerCase());
    }

    private toTitleCase = (word: string):string => 
         word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();

}