﻿using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using XOutput.DependencyInjection;

namespace XOutput.App.UI.Converter
{
    /// <summary>
    /// Converts a text based on the language, and updates when the language changes.
    /// </summary>
    /// <example>
    /// <TextBlock>
    ///     <TextBlock.Text>
    ///         <MultiBinding Converter="{StaticResource DynamicTranslator}">
    ///             <Binding Path="Translation.Language" />
    ///             <Binding Path="Model.DynamicField" />
    ///         </MultiBinding>
    ///     </TextBox.Text>
    /// </TextBox>
    /// </example>
    public class DynamicTranslationConverter : IMultiValueConverter
    {
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values.Length != 2)
            {
                throw new ArgumentException("There must be 2 values");
            }
            if (values[1] == null || values[1] == DependencyProperty.UnsetValue)
            {
                return "";
            }
            string key;
            if (values[1] is string)
            {
                key = values[1] as string;
            }
            else
            {
                throw new ArgumentException("Key is not a string");
            }
            return ApplicationContext.Global.Resolve<TranslationService>().Translate(key);
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
